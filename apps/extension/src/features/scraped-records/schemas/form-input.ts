import z from "zod";

export const scrapedRecordSchema = z.object({
  configId: z.string(),
  key: z.string(),
  data: z.record(z.string(), z.unknown()),
});
