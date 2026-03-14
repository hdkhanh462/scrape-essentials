import { map, pick } from "lodash";

import type { FieldInput } from "@/features/fields/types/form-input";
import type { ConfigField } from "@/lib/dexie";
import {
  isInputField,
  isInputFieldType,
  isPageUrlField,
  isScrapeField,
  isScrapeFieldType,
  isSelectField,
  isSelectFieldType,
} from "@/utils/config-field";

export function fieldInputToDb(
  input: FieldInput,
  configId: string,
  id?: string,
): ConfigField {
  let base: ConfigField = {
    id: id || crypto.randomUUID(),
    configId,
    ...pick(input, [
      "parentFieldId",
      "name",
      "order",
      "type",
      "isShowOnTable",
      "isFilterable",
      "isRequired",
    ]),
  };

  if (isInputField(input) || isSelectField(input)) {
    return {
      ...base,
      uiOptions: input.uiOptions,
    };
  }

  if (isPageUrlField(input) || isScrapeField(input)) {
    base = {
      ...base,
      isPrimary: input.isPrimary,
      regex: input.regex,
      spliter: input.spliter,
      removers: map(input.removers, "value"),
    };
  }

  if (isScrapeField(input)) {
    return {
      ...base,
      isParent: input.isParent,
      scrapeOptions: input.scrapeOptions,
    };
  }

  return base;
}

function pickBaseFieldInput(
  field: ConfigField,
  id: FieldInput["fieldId"] | undefined,
) {
  return {
    ...(id && { fieldId: id }),
    ...pick(field, [
      "parentFieldId",
      "name",
      "order",
      "isShowOnTable",
      "isFilterable",
      "isRequired",
    ]),
  };
}

export function dbFieldToFieldInput(
  field: ConfigField,
  id?: FieldInput["fieldId"],
): FieldInput {
  if (isInputFieldType(field.type)) {
    return {
      ...pickBaseFieldInput(field, id),
      type: field.type,
      uiOptions: {
        label: field.uiOptions?.label || "",
        defaultValue: field.uiOptions?.defaultValue,
      },
    };
  }

  if (isSelectFieldType(field.type)) {
    return {
      ...pickBaseFieldInput(field, id),
      type: field.type,
      uiOptions: {
        label: field.uiOptions?.label || "",
        defaultValue: field.uiOptions?.defaultValue,
        options: field.uiOptions?.options || [],
      },
    };
  }

  if (isScrapeFieldType(field.type)) {
    return {
      ...pickBaseFieldInput(field, id),
      type: field.type,
      isParent: field.isParent,
      isPrimary: field.isPrimary,
      regex: field.regex,
      spliter: field.spliter,
      removers: map(field.removers, (v) => ({ value: v })),
      scrapeOptions: {
        ...field.scrapeOptions,
        cssSelector: field.scrapeOptions?.cssSelector || "",
      },
    };
  }

  // PageUrl
  return {
    ...pickBaseFieldInput(field, id),
    type: field.type,
    isPrimary: field.isPrimary,
    regex: field.regex,
    spliter: field.spliter,
    removers: map(field.removers, (v) => ({ value: v })),
  };
}
