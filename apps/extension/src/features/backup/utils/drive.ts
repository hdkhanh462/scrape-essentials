import type { ScrapeConfig } from "@/lib/dexie";

export async function uploadToDrive(token: string, data: ScrapeConfig[]) {
  const metadata = {
    name: "backup_data.json",
    mimeType: "application/json",
  };

  const fileContent = JSON.stringify(data);

  const form = new FormData();
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" }),
  );
  form.append("file", new Blob([fileContent], { type: "application/json" }));

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    },
  );

  return response.json();
}
