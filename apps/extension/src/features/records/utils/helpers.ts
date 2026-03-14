import z from "zod";
import { type ConfigField, FieldType } from "@/lib/dexie";

export function getFieldType<T = unknown>(
  type: FieldType,
  values: T[],
  defaultValue: T,
) {
  let result: T;

  switch (true) {
    case type === FieldType.InputText:
    case type === FieldType.InputSelect:
    case type === FieldType.InputTextarea:
      result = values[0];
      break;
    case type === FieldType.InputNumber:
      result = values[1];
      break;
    case type === FieldType.InputCheckbox:
      result = values[2];
      break;
    default:
      result = defaultValue;
  }

  return result;
}

export function buildScrapedDataSchema(fields: ConfigField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    if (
      (!isInputFieldType(field.type) && !isSelectFieldType(field.type)) ||
      field.isParent
    )
      continue;
    let schema: z.ZodTypeAny;
    const type = getFieldType<z.ZodTypeAny>(
      field.type,
      [z.string(), z.coerce.number(), z.coerce.boolean()],
      z.any(),
    );

    if (field.isRequired) {
      schema = type.refine(
        (v) =>
          v !== undefined &&
          v !== null &&
          (Array.isArray(v) ? v.length > 0 : v !== ""),
        { message: `"${field.name}" is required` },
      );
    } else {
      schema = type.optional();
    }

    shape[field.name] = schema;
  }

  return z.object(shape);
}

export function buildDefaultScrapedData(fields: ConfigField[]) {
  const data: Record<string, unknown> = {};

  for (const field of fields) {
    if (
      isScrapeFieldType(field.type) ||
      isPageUrlFieldType(field.type) ||
      field.isParent
    ) {
      continue;
    }
    if (field.uiOptions?.defaultValue !== undefined) {
      data[field.name] = getFieldType(
        field.type,
        [
          field.uiOptions.defaultValue as string,
          Number(field.uiOptions.defaultValue),
          field.uiOptions.defaultValue === "true",
        ],
        field.uiOptions.defaultValue,
      );
    } else {
      const type = getFieldType(field.type, ["", 0, false], "");
      data[field.name] = type;
    }
  }

  return data;
}
