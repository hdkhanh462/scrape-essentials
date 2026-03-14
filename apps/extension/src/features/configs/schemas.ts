import z from "zod";

import { FieldSchema } from "@/features/fields/schemas";
import type { FieldInput } from "@/features/fields/types/form-input";
import type { FieldType } from "@/lib/dexie";

export const ConfigSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    domains: z
      .array(
        z.object({
          value: z.string().nonempty("Domain is required"),
        }),
      )
      .min(1, "At least one domain is required"),
    isActive: z.boolean().optional(),
    fields: z.array(FieldSchema).min(1, "At least one field is required"),
  })
  .superRefine((data, ctx) => {
    const rawKeys = data.fields.filter((f) => {
      if (isScrapeFieldType(f.type) || isPageUrlFieldType(f.type)) {
        f = f as Extract<FieldInput, { type: FieldType.PageUrl }>;
        return f.isPrimary;
      }
      return false;
    });

    if (rawKeys.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "A key field is required",
        path: ["fields"],
      });
      return;
    }

    if (rawKeys.length > 1) {
      ctx.addIssue({
        code: "custom",
        message: "Only one key field is allowed",
        path: ["fields"],
      });
      return;
    }
  });
