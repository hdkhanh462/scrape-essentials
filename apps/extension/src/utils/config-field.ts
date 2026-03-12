import type { FieldInput } from "@/features/config-fields/types/form-input";
import { FieldType } from "@/lib/dexie";

export function isLargeField(
  type: FieldType,
): type is Extract<FieldType, FieldType.InputTextarea> {
  return type === FieldType.InputTextarea;
}

export function isInputField(field: FieldInput): field is Extract<
  FieldInput,
  {
    type:
      | FieldType.InputText
      | FieldType.InputTextarea
      | FieldType.InputNumber
      | FieldType.InputCheckbox;
  }
> {
  return (
    field.type === FieldType.InputText ||
    field.type === FieldType.InputTextarea ||
    field.type === FieldType.InputNumber ||
    field.type === FieldType.InputCheckbox
  );
}

export function isSelectField(
  field: FieldInput,
): field is Extract<
  FieldInput,
  { type: FieldType.InputSelect | FieldType.InputMultiSelect }
> {
  return (
    field.type === FieldType.InputSelect ||
    field.type === FieldType.InputMultiSelect
  );
}

export function isScrapeField(field: FieldInput): field is Extract<
  FieldInput,
  {
    type:
      | FieldType.Text
      | FieldType.Link
      | FieldType.Image
      | FieldType.ElementAttribute;
  }
> {
  return (
    field.type === FieldType.Text ||
    field.type === FieldType.Link ||
    field.type === FieldType.Image ||
    field.type === FieldType.ElementAttribute
  );
}

export function isPageUrlField(
  field: FieldInput,
): field is Extract<FieldInput, { type: FieldType.PageUrl }> {
  return field.type === FieldType.PageUrl;
}

export function isInputFieldType(type: FieldType) {
  return (
    type === FieldType.InputText ||
    type === FieldType.InputTextarea ||
    type === FieldType.InputNumber ||
    type === FieldType.InputCheckbox
  );
}

export function isSelectFieldType(type: FieldType) {
  return type === FieldType.InputSelect || type === FieldType.InputMultiSelect;
}

export function isScrapeFieldType(type: FieldType) {
  return (
    type === FieldType.Text ||
    type === FieldType.Link ||
    type === FieldType.Image ||
    type === FieldType.ElementAttribute
  );
}

export function isPageUrlFieldType(type: FieldType) {
  return type === FieldType.PageUrl;
}
