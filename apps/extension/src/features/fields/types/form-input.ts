import type { FieldErrors } from "react-hook-form";
import type z from "zod";

import type { FieldSchema } from "@/features/fields/schemas";
import type { ConfigField, FieldType } from "@/lib/dexie";

export type FieldInput = z.infer<typeof FieldSchema> & {
  fieldId?: ConfigField["id"];
};

export type FullErrors = FieldErrors<
  Extract<
    FieldInput,
    {
      type:
        | FieldType.Text
        | FieldType.Link
        | FieldType.Image
        | FieldType.ElementAttribute;
    }
  >
> &
  FieldErrors<
    Extract<
      FieldInput,
      {
        type:
          | FieldType.InputText
          | FieldType.InputTextarea
          | FieldType.InputNumber
          | FieldType.InputCheckbox;
      }
    >
  > &
  FieldErrors<
    Extract<
      FieldInput,
      {
        type: FieldType.InputSelect | FieldType.InputMultiSelect;
      }
    >
  > &
  FieldErrors<
    Extract<
      FieldInput,
      {
        type: FieldType.PageUrl;
      }
    >
  >;
