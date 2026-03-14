import {
  BACKUP_FILE_NAME_PREFIX,
  BACKUP_FOLDER_NAME,
} from "@/features/backup/constants";
import { getAccessToken } from "@/features/backup/identity";
import { useGoogleStore } from "@/features/backup/stores/google.store";
import type { ImportPayload } from "@/features/backup/types";
import { driveApiUrl } from "@/features/backup/utils";
import { dexie } from "@/lib/dexie";

export async function getOrCreateBackupFolder(token: string): Promise<string> {
  const searchUrl = driveApiUrl("files", {
    q: `name='${BACKUP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder'`,
  });

  const search = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const result = await search.json();

  if (result.files.length > 0) {
    return result.files[0].id;
  }

  const create = await fetch(driveApiUrl("files"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: BACKUP_FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder",
    }),
  });

  const folder = await create.json();
  return folder.id;
}

export async function uploadBackup(
  token: string,
  folderId: string,
  blob: Blob,
  version: string = "0.1.0",
) {
  const date = new Date().toISOString().slice(0, 10);

  const metadata = {
    name: `${BACKUP_FILE_NAME_PREFIX}v${version}_${date}.json.gz`,
    parents: [folderId],
  };

  const form = new FormData();

  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" }),
  );

  form.append("file", blob);

  await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    },
  );
}

export async function getLatestBackup(token: string, folderId: string) {
  const url = driveApiUrl("files", {
    q: `name contains '${BACKUP_FILE_NAME_PREFIX}' and '${folderId}' in parents and trashed=false`,
    orderBy: "createdTime desc",
    pageSize: "1",
  });

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!data.files?.length) {
    throw new Error("No backup found");
  }

  return data.files[0];
}

export async function downloadBackup(token: string, fileId: string) {
  const url = driveApiUrl(`files/${fileId}`, {
    alt: "media",
  });

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await res.arrayBuffer();
}

export async function backupToDrive(
  { authIfMissing } = { authIfMissing: true },
) {
  const { backupFolderId, setBackupFolderId, setLastBackup } =
    useGoogleStore.getState();

  const accessToken = await getAccessToken({ authIfMissing });
  if (!accessToken) {
    if (authIfMissing) throw new Error("No access token found");
    return;
  }

  let folderId = backupFolderId;
  if (!folderId) {
    folderId = await getOrCreateBackupFolder(accessToken);
    setBackupFolderId(folderId);
  }

  const [configs, fields, records] = await Promise.all([
    dexie.scrapeConfigs.toArray(),
    dexie.configFields.toArray(),
    dexie.scrapedRecords.toArray(),
  ]);

  const blob = gzipJSON({ configs, fields, records });
  await uploadBackup(accessToken, folderId, blob, browser.runtime.getVersion());

  setLastBackup(Date.now());
}

export async function restoreBackup(): Promise<ImportPayload> {
  const { backupFolderId, setBackupFolderId, setLastRestore } =
    useGoogleStore.getState();

  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error("No access token found");

  let folderId = backupFolderId;
  if (!folderId) {
    folderId = await getOrCreateBackupFolder(accessToken);
    setBackupFolderId(folderId);
  }

  const latest = await getLatestBackup(accessToken, folderId);
  if (!latest) throw new Error("No backup found");

  const buffer = await downloadBackup(accessToken, latest.id);
  const payload = ungzipJSON<ImportPayload>(buffer);

  setLastRestore(Date.now());

  return payload;
}
