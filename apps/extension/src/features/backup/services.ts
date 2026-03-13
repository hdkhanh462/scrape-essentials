import { shouldBackup } from "@/features/backup/utils";
import { getAccessToken } from "@/features/backup/utils/identity";
import { dexie } from "@/lib/dexie";
import type { GoogleUserInfo, ImportPayload } from "@/features/backup/types";

export async function getOrCreateBackupFolder(token: string): Promise<string> {
  const search = await fetch(
    "https://www.googleapis.com/drive/v3/files?q=name='app_backups' and mimeType='application/vnd.google-apps.folder'",
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  const result = await search.json();

  if (result.files.length > 0) {
    return result.files[0].id;
  }

  const create = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "app_backups",
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
    name: `backup_v${version}_${date}.json.gz`,
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

export async function getLatestBackup(token: string) {
  const res = await fetch(
    "https://www.googleapis.com/drive/v3/files?q=name contains 'backup_'&orderBy=createdTime desc&pageSize=1",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await res.json();

  if (!data.files?.length) {
    throw new Error("No backup found");
  }

  return data.files[0];
}

export async function downloadBackup(token: string, fileId: string) {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return await res.arrayBuffer();
}

export async function restoreBackup(): Promise<ImportPayload> {
  const token = await getAccessToken();

  if (!token) throw new Error("No token found");

  const latest = await getLatestBackup(token);
  const buffer = await downloadBackup(token, latest.id);

  return ungzipJSON<ImportPayload>(buffer);
}

export async function backupToDrive(): Promise<void> {
  const token = await getAccessToken();

  if (!token) throw new Error("No token found");

  const folderId = await getOrCreateBackupFolder(token);

  const configs = await dexie.scrapeConfigs.toArray();
  const fields = await dexie.configFields.toArray();
  const records = await dexie.scrapedRecords.toArray();

  const blob = gzipJSON({ configs, fields, records });

  await uploadBackup(token, folderId, blob, browser.runtime.getVersion());
  await storage.setItem("local:lastBackup", Date.now());
}

export async function autoBackupToDrive() {
  if (await shouldBackup()) {
    await backupToDrive();
  }
}

export async function getUserInfo(): Promise<GoogleUserInfo | null> {
  let userInfo = await storage.getItem<GoogleUserInfo | null>("local:userInfo");
  if (userInfo) return userInfo;

  const token = await getAccessToken(false);
  if (!token) return null;

  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) return null;

  userInfo = await res.json();
  await storage.setItem("local:userInfo", userInfo);

  return userInfo;
}
