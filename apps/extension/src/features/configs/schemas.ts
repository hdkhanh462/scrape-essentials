import z from "zod";

import { FieldSchema } from "@/features/fields/schemas";
import type { FieldInput } from "@/features/fields/types/form-input";
import type { FieldType } from "@/lib/dexie";
import { isPageUrlFieldType, isScrapeFieldType } from "@/utils/config-field";

export const ConfigSchema = z
  .object({
    name: z.string().nonempty("fieldRequired"),
    domains: z
      .array(
        z.object({
          value: z.string().nonempty("fieldRequired"),
        }),
      )
      .min(1, "atLeastOneDomain"),
    isActive: z.boolean().optional(),
    fields: z.array(FieldSchema).min(1, "atLeastOneField"),
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
        message: "atLeastOneKeyField",
        path: ["fields"],
      });
      return;
    }

    if (rawKeys.length > 1) {
      ctx.addIssue({
        code: "custom",
        message: "onlyOneKeyFieldAllowed",
        path: ["fields"],
      });
      return;
    }
  });
