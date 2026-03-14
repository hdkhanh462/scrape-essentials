import { RecordSchema } from "@/features/records/schemas";
import type { buildScrapedDataSchema } from "@/features/records/utils/helpers";
import type z from "zod";

export type RecordInput = z.infer<typeof RecordSchema>;

export type ScrapedDataInput = z.infer<
  ReturnType<typeof buildScrapedDataSchema>
>;
