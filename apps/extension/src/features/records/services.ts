import type {
  AddScrapedRecordPayload,
  EditScrapedRecordPayload,
  GetScrapedRecordPayload,
  GetScrapedRecordsPayload,
  ImportRecordsPayload,
} from "@/features/records/types";
import { dexie, type ScrapedRecord } from "@/lib/dexie";

export const getRecords = async (
  payload: GetScrapedRecordsPayload,
): Promise<ScrapedRecord[]> => {
  if (!payload.configId) return [];

  return await dexie.scrapedRecords
    .where("configId")
    .equals(payload.configId)
    .toArray();
};

export const getRecordById = async (
  payload: GetScrapedRecordPayload,
): Promise<ScrapedRecord | null> => {
  if (!payload.id || !payload.key) return null;

  const result = await dexie.scrapedRecords
    .where({ configId: payload.id, key: payload.key })
    .first();

  return result || null;
};

export const importRecords = async (
  payload: ImportRecordsPayload,
): Promise<boolean> => {
  await dexie.scrapedRecords.clear();
  await dexie.scrapedRecords.bulkAdd(payload);
  return true;
};

export const addRecord = async (
  payload: AddScrapedRecordPayload,
): Promise<ScrapedRecord["id"]> => {
  const exists = await dexie.scrapedRecords
    .where({ configId: payload.id, key: payload.data.key })
    .first();

  if (exists) {
    throw new Error("Scraped data with the same key value already exists");
  }

  const now = new Date().toISOString();
  const newId = await dexie.scrapedRecords.add({
    ...payload.data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  });
  return newId;
};

export const editRecord = async (
  payload: EditScrapedRecordPayload,
): Promise<boolean> => {
  const row = await dexie.scrapedRecords.update(payload.id, {
    ...payload.data,
    updatedAt: new Date().toISOString(),
  });
  return row > 0;
};

export const deleteRecord = async (
  id: ScrapedRecord["id"],
): Promise<boolean> => {
  await dexie.scrapedRecords.delete(id);
  return true;
};
