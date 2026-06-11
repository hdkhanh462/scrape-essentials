import z from "zod";
import { FieldType } from "@/lib/dexie";

const TextSchema = z.object({
  isPrimary: z.boolean().optional(),
  regex: z.string().optional(),
  spliter: z.string().optional(),
  removers: z
    .array(
      z.object({
        value: z.string().nonempty("fieldRequired"),
      }),
    )
    .optional(),
});

const typeUnion = z.discriminatedUnion("type", [
  z.object({
    type: z.literal([
      FieldType.InputText,
      FieldType.InputNumber,
      FieldType.InputCheckbox,
      FieldType.InputTextarea,
      FieldType.InputTags,
    ]),
    uiOptions: z.object({
      label: z.string().nonempty("fieldRequired"),
      defaultValue: z.any().optional(),
    }),
  }),
  z.object({
    type: z.literal([FieldType.InputSelect, FieldType.InputMultiSelect]),
    uiOptions: z.object({
      label: z.string().nonempty("fieldRequired"),
      defaultValue: z.any().optional(),
      options: z
        .array(
          z.object({
            label: z.string().nonempty("fieldRequired"),
            value: z.string().nonempty("fieldRequired"),
          }),
        )
        .min(1, "atLeastOneOption"),
    }),
  }),
  z.object({
    type: z.literal([
      FieldType.Text,
      FieldType.Link,
      FieldType.Image,
      FieldType.ElementAttribute,
    ]),
    isParent: z.boolean().optional(),
    scrapeOptions: z.object({
      cssSelector: z.string(),
      condition: z.string().optional(),
      attributeName: z.string().optional(),
      isMultiple: z.boolean().optional(),
    }),
    ...TextSchema.shape,
  }),
  z.object({
    type: z.literal(FieldType.PageUrl),
    ...TextSchema.shape,
  }),
]);

export const FieldSchema = z
  .object({
    fieldId: z.string().optional(),
    parentFieldId: z.string().optional(),
    name: z.string().nonempty("fieldRequired"),
    order: z.number().min(0, "mustBeNonNegative"),
    isRequired: z.boolean().optional(),
    isFilterable: z.boolean().optional(),
    isShowOnTable: z.boolean().optional(),
  })
  .and(typeUnion);
