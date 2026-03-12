import { FieldType } from "@/lib/dexie";

export const typeLabels: Record<FieldType, string> = {
  [FieldType.PageUrl]: "Page URL",
  [FieldType.Text]: "Text",
  [FieldType.Link]: "Link",
  [FieldType.Image]: "Image",
  [FieldType.ElementAttribute]: "Element Attribute",
  [FieldType.InputSelect]: "Select",
  [FieldType.InputMultiSelect]: "Multi Select",
  [FieldType.InputText]: "Input Text",
  [FieldType.InputNumber]: "Input Number",
  [FieldType.InputTextarea]: "Textarea",
  [FieldType.InputCheckbox]: "Checkbox",
};
