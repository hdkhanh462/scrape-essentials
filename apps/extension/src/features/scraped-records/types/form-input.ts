import type z from "zod";
import type { scrapedRecordSchema } from "@/features/scraped-records/schemas/form-input";
import type { buildScrapedDataSchema } from "@/features/scraped-records/utils/helpers";

export type ScrapedRecordInput = z.infer<typeof scrapedRecordSchema>;
export type ScrapedDataInput = z.infer<
  ReturnType<typeof buildScrapedDataSchema>
>;
