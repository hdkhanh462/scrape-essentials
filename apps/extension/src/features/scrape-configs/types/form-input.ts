import type z from "zod";
import type { FieldInput } from "@/features/fields/types/form-input";
import type { configSchema } from "@/features/scrape-configs/schemas/form-input";

export type ConfigInput = z.infer<typeof configSchema> & {
  fields: FieldInput[];
};
