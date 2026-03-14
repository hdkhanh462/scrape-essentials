import type { RecordInput } from "@/features/records/types/form-input";
import type { ScrapeConfig, ScrapedRecord } from "@/lib/dexie";

export type GetScrapedRecordsPayload = {
  configId?: ScrapeConfig["id"];
};

export type GetScrapedRecordPayload = Partial<
  Pick<ScrapedRecord, "id" | "key">
>;

export type AddScrapedRecordPayload = {
  id: ScrapedRecord["id"];
  data: RecordInput;
};

export type EditScrapedRecordPayload = {
  id: ScrapedRecord["id"];
  data: Pick<RecordInput, "data">;
};

export type DeleteScrapedRecordPayload = ScrapedRecord["id"];

export type ImportRecordsPayload = ScrapedRecord[];
