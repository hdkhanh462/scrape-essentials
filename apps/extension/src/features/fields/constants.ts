import { FieldType } from "@/lib/dexie";

export const typeLabels: Record<FieldType, string> = {
  [FieldType.PageUrl]: "Page URL",

  // Data fields
  [FieldType.Text]: "Text",
  [FieldType.Link]: "Link",
  [FieldType.Image]: "Image",
  [FieldType.ElementAttribute]: "Element Attribute",

  // Input fields
  [FieldType.InputText]: "Input Text",
  [FieldType.InputNumber]: "Input Number",
  [FieldType.InputCheckbox]: "Checkbox",
  [FieldType.InputSelect]: "Select",
  [FieldType.InputMultiSelect]: "Multi Select",

  // Large input fields
  [FieldType.InputTextarea]: "Textarea",
  [FieldType.InputTags]: "Tags",
};
