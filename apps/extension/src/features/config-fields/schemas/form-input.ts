import z from "zod";
import { FieldType } from "@/lib/dexie";

const textSchema = z.object({
  isPrimary: z.boolean().optional(),
  regex: z.string().optional(),
  spliter: z.string().optional(),
  removers: z
    .array(
      z.object({
        value: z.string().nonempty("Remover value is required"),
      }),
    )
    .optional(),
});

const typeUnion = z.discriminatedUnion("type", [
  z.object({
    type: z.literal([
      FieldType.InputText,
      FieldType.InputTextarea,
      FieldType.InputNumber,
      FieldType.InputCheckbox,
    ]),
    uiOptions: z.object({
      label: z.string().nonempty("Label is required"),
      defaultValue: z.any().optional(),
    }),
  }),
  z.object({
    type: z.literal([FieldType.InputSelect, FieldType.InputMultiSelect]),
    uiOptions: z.object({
      label: z.string().nonempty("Label is required"),
      defaultValue: z.any().optional(),
      options: z
        .array(
          z.object({
            label: z.string().nonempty("Option label is required"),
            value: z.string().nonempty("Option value is required"),
          }),
        )
        .min(1, "At least one option is required"),
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
    ...textSchema.shape,
  }),
  z.object({
    type: z.literal(FieldType.PageUrl),
    ...textSchema.shape,
  }),
]);

export const fieldSchema = z
  .object({
    parentFieldId: z.string().optional(),
    name: z.string().nonempty("Field name is required"),
    order: z.number().min(0, "Order must be a non-negative number"),
    isRequired: z.boolean().optional(),
    isFilterable: z.boolean().optional(),
    isShowOnTable: z.boolean().optional(),
  })
  .and(typeUnion);
