import z from "zod";
import { type ConfigField, FieldType } from "@/lib/dexie";
import {
  isInputFieldType,
  isLargeField,
  isPageUrlFieldType,
  isScrapeFieldType,
  isSelectFieldType,
} from "@/utils/config-field";
import { logger } from "@/utils/logger";

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

export const groupItems = (fields: ConfigField[]) => {
  const rows: ConfigField[][] = [];
  let i = 0;

  while (i < fields.length) {
    const current = fields[i];
    const next = fields[i + 1];

    const isCurrentLarge = isLargeField(current.type);
    const isNextLarge = next ? isLargeField(next.type) : false;

    // CASE 1: large + large -> share same row
    if (isCurrentLarge && isNextLarge) {
      rows.push([current, next]);
      i += 2;
      continue;
    }

    // CASE 2: large + small -> split into two rows immediately
    if (isCurrentLarge && next && !isNextLarge) {
      rows.push([current]); // large full width
      rows.push([next]); // small also forced to its own row
      i += 2;
      continue;
    }

    // CASE 3: small + large -> split into two rows
    if (!isCurrentLarge && isNextLarge) {
      rows.push([current]); // small alone
      rows.push([next]); // large alone
      i += 2;
      continue;
    }

    // CASE 4: small + small -> share row
    if (!isCurrentLarge && next && !isNextLarge) {
      rows.push([current, next]);
      i += 2;
      continue;
    }

    // CASE 5: last remaining item
    rows.push([current]);
    i++;
  }

  logger.debug("Grouped fields into rows:", rows);

  return rows;
};
