import { BACKUP_FILE_NAME } from "@/features/backup/constants";
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
  shouldBackup,
} from "@/features/backup/utils";
import { useSettingsStore } from "@/features/settings/stores/settings.store";
import { logger } from "@/utils/logger";

async function readDriveError(res: Response): Promise<string> {
  const data = await res.json().catch(() => null);
  return data?.error?.message ?? `Google Drive request failed (${res.status})`;
}

export async function getBackupMetadata(): Promise<BackupMetadata | null> {
  const accessToken = await getAccessToken({ authIfMissing: false });
  if (!accessToken) return null;

  const url = driveApiUrl("/files", {
    spaces: "appDataFolder",
    q: `name='${BACKUP_FILE_NAME}' and trashed=false`,
    fields: "files(id,name,size,modifiedTime)",
  });

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(await readDriveError(res));

  const data = await res.json();
  const file = data.files?.[0];

  return file
    ? {
        id: file.id,
        name: file.name,
        size: Number(file.size ?? 0),
        modifiedTime: file.modifiedTime,
      }
    : null;
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

export async function uploadBackup(
  { authIfMissing } = { authIfMissing: true },
): Promise<BackupMetadata | undefined> {
  const accessToken = await getAccessToken({ authIfMissing });
  if (!accessToken) {
    if (authIfMissing) throw new Error("No access token found");
    return;
  }

  const blob = await serializeBackup();
  const existing = await getBackupMetadata();

  const res = existing
    ? await fetch(
        driveUploadApiUrl(`/files/${existing.id}`, { uploadType: "media" }),
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: blob,
        },
      )
    : await fetch(driveUploadApiUrl("/files", { uploadType: "multipart" }), {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: (() => {
          const form = new FormData();
          form.append(
            "metadata",
            new Blob(
              [
                JSON.stringify({
                  name: BACKUP_FILE_NAME,
                  parents: ["appDataFolder"],
                }),
              ],
              { type: "application/json" },
            ),
          );
          form.append("file", blob);
          return form;
        })(),
      });

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

export async function downloadBackup(): Promise<RestorePayload> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error("No access token found");

  const metadata = await getBackupMetadata();
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

export async function deleteBackup(): Promise<void> {
  const accessToken = await getAccessToken({ authIfMissing: false });
  if (!accessToken) return;

  const metadata = await getBackupMetadata();
  if (!metadata) return;

  const res = await fetch(driveApiUrl(`/files/${metadata.id}`), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(await readDriveError(res));

  useGoogleStore.getState().setBackupMetadata(null);
}

export const autoBackup = async () => {
  const { autoBackup: autoBackupEnabled } = useSettingsStore.getState();
  if (!autoBackupEnabled || !shouldBackup(60)) return;

  logger.debug("Auto backup triggered");
  await uploadBackup({ authIfMissing: false });
};
