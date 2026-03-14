import type z from "zod";
import type { RecordSchema } from "@/features/records/schemas";
import type { buildScrapedDataSchema } from "@/features/records/utils/helpers";

export type RecordInput = z.infer<typeof RecordSchema>;

export type ScrapedDataInput = z.infer<
  ReturnType<typeof buildScrapedDataSchema>
>;
