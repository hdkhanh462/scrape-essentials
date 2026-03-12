import type { Control } from "react-hook-form";

import { SelectItem } from "@/components/ui/select";
import type { ScrapedDataInput } from "@/features/scraped-records/types/form-input";
import { type ConfigField, FieldType } from "@/lib/dexie";

interface UiFieldProps {
  field: ConfigField;
  control: Control<ScrapedDataInput>;
}

export default function UiField({ field, control }: UiFieldProps) {
  switch (field.type) {
    case FieldType.InputText:
      return (
        <FormInput
          control={control}
          name={field.name}
          label={field.name}
          inputProps={{
            autoComplete: "off",
          }}
        />
      );
    case FieldType.InputNumber:
      return (
        <FormNumberInput
          control={control}
          name={field.name}
          label={field.name}
          inputProps={{
            autoComplete: "off",
          }}
        />
      );
    case FieldType.InputTextarea:
      return (
        <FormTextarea control={control} name={field.name} label={field.name} />
      );
    case FieldType.InputCheckbox:
      return (
        <FormCheckbox control={control} name={field.name} label={field.name} />
      );
    case FieldType.InputSelect:
      return (
        <FormSelect
          control={control}
          name={field.name}
          label={field.name}
          inputProps={{
            children: field.uiOptions?.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            )),
          }}
        />
      );
    default:
      return null;
  }
}
