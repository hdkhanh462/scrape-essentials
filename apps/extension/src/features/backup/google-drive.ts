import {
  BACKUP_FILE_NAME,
  BACKUP_FILE_PREFIX,
} from "@/features/backup/constants";
import {
  getAccessToken,
  launchWebAuthFlow,
  revokeToken,
} from "@/features/backup/identity";
import {
  deserializeBackup,
  serializeBackup,
} from "@/features/backup/serializer";
import { useGoogleStore } from "@/features/backup/stores/google.store";
import type { BackupMetadata, RestorePayload } from "@/features/backup/types";
import {
  driveApiUrl,
  driveUploadApiUrl,
  shouldCreateNewBackup,
} from "@/features/backup/utils";
import { useSettingsStore } from "@/features/settings/stores/settings.store";
import { logger } from "@/utils/logger";

async function readDriveError(res: Response): Promise<string> {
  const data = await res.json().catch(() => null);
  return data?.error?.message ?? `Google Drive request failed (${res.status})`;
}

// biome-ignore lint/suspicious/noExplicitAny: raw Google Drive API file resource
function toBackupMetadata(file: any): BackupMetadata {
  return {
    id: file.id,
    name: file.name,
    size: Number(file.size ?? 0),
    modifiedTime: file.modifiedTime,
    createdTime: file.createdTime,
    extensionVersion: file.appProperties?.extensionVersion,
  };
}

/** Every backup file this extension has ever written, newest first (covers both the legacy single-file name and versioned `backup-<timestamp>` files). */
export async function listBackups(): Promise<BackupMetadata[]> {
  const accessToken = await getAccessToken({ authIfMissing: false });
  if (!accessToken) return [];

  const url = driveApiUrl("/files", {
    spaces: "appDataFolder",
    q: "name contains 'backup' and trashed=false",
    fields: "files(id,name,size,modifiedTime,createdTime,appProperties)",
    orderBy: "createdTime desc",
  });

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(await readDriveError(res));

  const data = await res.json();
  return (data.files ?? []).map(toBackupMetadata);
}

export async function getBackupMetadata(): Promise<BackupMetadata | null> {
  const backups = await listBackups();
  return backups[0] ?? null;
}

export async function connectGoogle(): Promise<void> {
  const { login, setUserInfo } = useGoogleStore.getState();

  const response = await launchWebAuthFlow();
  login(response);

  if (response.accessToken) {
    const userInfoRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${response.accessToken}` } },
    );
    if (userInfoRes.ok) setUserInfo(await userInfoRes.json());
  }
}

export async function disconnectGoogle(): Promise<void> {
  const { accessToken, refreshToken, logout, setBackupMetadata } =
    useGoogleStore.getState();

  if (accessToken) await revokeToken(accessToken);
  else if (refreshToken) await revokeToken(refreshToken);

  setBackupMetadata(null);
  logout();
}

async function createBackupFile(
  accessToken: string,
  blob: Blob,
  name: string,
  extensionVersion: string,
): Promise<Response> {
  const form = new FormData();
  form.append(
    "metadata",
    new Blob(
      [
        JSON.stringify({
          name,
          parents: ["appDataFolder"],
          appProperties: { extensionVersion },
        }),
      ],
      { type: "application/json" },
    ),
  );
  form.append("file", blob);

  return fetch(driveUploadApiUrl("/files", { uploadType: "multipart" }), {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });
}

async function overwriteBackupFile(
  accessToken: string,
  blob: Blob,
  fileId: string,
): Promise<Response> {
  return fetch(driveUploadApiUrl(`/files/${fileId}`, { uploadType: "media" }), {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: blob,
  });
}

async function deleteBackupFile(
  accessToken: string,
  fileId: string,
): Promise<void> {
  const res = await fetch(driveApiUrl(`/files/${fileId}`), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(await readDriveError(res));
}

async function enforceRetention(
  accessToken: string,
  backups: BackupMetadata[],
  maxCount: number,
): Promise<void> {
  // `backups` is newest-first; drop the oldest ones beyond the retention limit.
  const toDelete = backups.slice(maxCount);

  for (const backup of toDelete) {
    logger.debug("Pruning old backup beyond retention limit:", backup.name);
    await deleteBackupFile(accessToken, backup.id);
  }
}

export async function uploadBackup(
  { authIfMissing } = { authIfMissing: true },
): Promise<BackupMetadata | undefined> {
  const accessToken = await getAccessToken({ authIfMissing });
  if (!accessToken) {
    if (authIfMissing) throw new Error("No access token found");
    return;
  }

  const { versionedBackup, versionedBackupMinIntervalHours, maxBackupsToKeep } =
    useSettingsStore.getState();

  const blob = await serializeBackup();
  const currentVersion = browser.runtime.getManifest().version;

  let res: Response;

  if (!versionedBackup) {
    const existing = await getBackupMetadata();
    res = existing
      ? await overwriteBackupFile(accessToken, blob, existing.id)
      : await createBackupFile(
          accessToken,
          blob,
          BACKUP_FILE_NAME,
          currentVersion,
        );
  } else {
    const backups = await listBackups();
    const latest = backups[0];
    const createNew =
      !latest ||
      shouldCreateNewBackup(latest, {
        minIntervalHours: versionedBackupMinIntervalHours,
        currentVersion,
      });

    res = createNew
      ? await createBackupFile(
          accessToken,
          blob,
          `${BACKUP_FILE_PREFIX}${Date.now()}.json.gz`,
          currentVersion,
        )
      : await overwriteBackupFile(accessToken, blob, latest.id);

    if (res.ok && createNew) {
      await enforceRetention(
        accessToken,
        await listBackups(),
        maxBackupsToKeep,
      );
    }
  }

  if (!res.ok) {
    const message = await readDriveError(res);
    logger.error("Failed to upload backup:", { status: res.status, message });
    throw new Error(message);
  }

  const metadata = await getBackupMetadata();
  useGoogleStore.getState().setBackupMetadata(metadata);
  useGoogleStore.getState().setLastBackup(Date.now());

  logger.debug("Backup successfully uploaded to Google Drive");

  return metadata ?? undefined;
}

export async function downloadBackup(fileId?: string): Promise<RestorePayload> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error("No access token found");

  const metadata = fileId
    ? ((await listBackups()).find((backup) => backup.id === fileId) ?? null)
    : await getBackupMetadata();
  if (!metadata) throw new Error("No backup found");

  const url = driveApiUrl(`/files/${metadata.id}`, { alt: "media" });
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(await readDriveError(res));

  const buffer = await res.arrayBuffer();
  const payload = deserializeBackup(buffer);

  useGoogleStore.getState().setLastRestore(Date.now());

  return {
    payload,
    backupFileName: metadata.name,
    modifiedTime: metadata.modifiedTime,
  };
}

export async function deleteBackup(fileId?: string): Promise<void> {
  const accessToken = await getAccessToken({ authIfMissing: false });
  if (!accessToken) return;

  const metadata = fileId
    ? ((await listBackups()).find((backup) => backup.id === fileId) ?? null)
    : await getBackupMetadata();
  if (!metadata) return;

  await deleteBackupFile(accessToken, metadata.id);

  useGoogleStore.getState().setBackupMetadata(await getBackupMetadata());
}
