import { Controller } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import FieldSelector from "@/features/fields/components/field-selector";
import type { FieldTypePropsV2 } from "@/features/fields/types/field";
import { dexie } from "@/lib/dexie";

export default function SelectorFields({ form, fullErrors }: FieldTypePropsV2) {
  const fetchFieldItems = async (value: string) => {
    return await dexie.configFields
      .where("name")
      .startsWithIgnoreCase(value)
      .toArray();
  };
  const fetchFieldLabel = async (value: string) => {
    return await dexie.configFields.get(value);
  };

  return (
    <>
      <Controller
        name="parentFieldId"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Parent Field</FieldLabel>
            <FieldSelector
              value={field.value}
              onChange={field.onChange}
              placeholder="Select parent field"
              fetchItems={fetchFieldItems}
              fetchLabel={fetchFieldLabel}
            />
          </Field>
        )}
      />
      {fullErrors?.parentFieldId && (
        <FieldError errors={[fullErrors?.parentFieldId]} />
      )}
    </>
  );
}
