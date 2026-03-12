import { useWatch } from "react-hook-form";
import type { FieldTypePropsV2 } from "@/features/config-fields/types/field";

export default function CheckboxFields({ form }: FieldTypePropsV2) {
  const type = useWatch({
    control: form.control,
    name: "type",
  });
  const isPrimary = useWatch({
    control: form.control,
    name: "isPrimary",
  });

  return (
    <div className="grid grid-cols-2 gap-2">
      <FormCheckbox
        control={form.control}
        name="isShowOnTable"
        label="Show On Table"
      />
      <FormCheckbox
        control={form.control}
        name="isFilterable"
        label="Filterable"
      />
      <FormCheckbox
        control={form.control}
        name="isRequired"
        label="Required"
        inputProps={{ disabled: isPrimary }}
      />
      {(isScrapeFieldType(type) || isPageUrlFieldType(type)) && (
        <FormCheckbox control={form.control} name="isPrimary" label="Primary" />
      )}
      {isScrapeFieldType(type) && (
        <>
          <FormCheckbox
            control={form.control}
            name="scrapeOptions.isMultiple"
            label="Multiple"
          />
          <FormCheckbox control={form.control} name="isParent" label="Parent" />
        </>
      )}
    </div>
  );
}
