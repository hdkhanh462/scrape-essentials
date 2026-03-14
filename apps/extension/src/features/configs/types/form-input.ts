import type z from "zod";

import type { ConfigSchema } from "@/features/configs/schemas";
import type { FieldInput } from "@/features/fields/types/form-input";

export type ConfigInput = z.infer<typeof ConfigSchema> & {
  fields: FieldInput[];
};
