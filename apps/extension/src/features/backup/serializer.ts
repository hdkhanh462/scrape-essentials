import { CURRENT_SCHEMA_VERSION } from "@/features/backup/constants";
import type { ImportPayload } from "@/features/backup/types";
import { dexie } from "@/lib/dexie";
import { gzipJSON, ungzipJSON } from "@/utils/gzip";

export async function serializeBackup(): Promise<Blob> {
  const [configs, fields, records] = await Promise.all([
    dexie.scrapeConfigs.toArray(),
    dexie.configFields.toArray(),
    dexie.scrapedRecords.toArray(),
  ]);

  const payload: ImportPayload = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    configs,
    fields,
    records,
  };

  return gzipJSON(payload);
}

export function deserializeBackup(buffer: ArrayBuffer): ImportPayload {
  const payload = ungzipJSON<ImportPayload>(buffer);

  if (payload.schemaVersion > CURRENT_SCHEMA_VERSION) {
    throw new Error(
      `Backup was created by a newer version of the extension (schema v${payload.schemaVersion}); please update the extension before restoring`,
    );
  }

  return payload;
}
