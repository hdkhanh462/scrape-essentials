import { XIcon } from "lucide-react";
import {
  Controller,
  type ControllerRenderProps,
  useFieldArray,
  useWatch,
} from "react-hook-form";

import { FormInput } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SelectItem } from "@/components/ui/select";
import type { FieldTypePropsV2 } from "@/features/fields/types/field";
import type {
  FieldInput,
  FullErrors,
} from "@/features/fields/types/form-input";
import { FieldType } from "@/lib/dexie";

export function UiField({ form, fullErrors }: FieldTypePropsV2) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "uiOptions.options",
  });

  const type = useWatch({
    control: form.control,
    name: "type",
  });

  const defaultValueElm = () => {
    switch (type) {
      case FieldType.InputNumber:
        return (
          <FormNumberInput
            control={form.control}
            name="uiOptions.defaultValue"
            label="Default Value"
            hideError
            inputProps={{
              placeholder: "Enter default value",
              autoComplete: "off",
            }}
          />
        );
      case FieldType.InputCheckbox:
        return (
          <FormSelect
            control={form.control}
            name="uiOptions.defaultValue"
            label="Default Value"
            hideError
            inputProps={{
              placeholder: "Select default value",
              children: (
                <>
                  <SelectItem value="true">True</SelectItem>
                  <SelectItem value="false">False</SelectItem>
                </>
              ),
            }}
          />
        );
      default:
        return (
          <FormInput
            control={form.control}
            name="uiOptions.defaultValue"
            label="Default Value"
            hideError
            inputProps={{
              placeholder: "Enter default value",
              autoComplete: "off",
            }}
          />
        );
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <FormInput
          control={form.control}
          name="uiOptions.label"
          label="Label"
          hideError
          inputProps={{
            placeholder: "Enter label",
            autoComplete: "off",
          }}
        />
        {defaultValueElm()}
        {(fullErrors?.uiOptions?.label ||
          fullErrors?.uiOptions?.defaultValue) && (
          <FieldError
            errors={[
              fullErrors?.uiOptions?.label,
              fullErrors?.uiOptions?.defaultValue,
            ]}
          />
        )}
      </div>
      {isSelectFieldType(type) && (
        <FieldSet>
          <FieldLegend className="text-sm!">Options</FieldLegend>
          <FieldGroup className="gap-3">
            {fields.map((item, index) => (
              <Controller
                key={item.id}
                name={`uiOptions.options.${index}`}
                control={form.control}
                render={({ field, formState: { errors } }) => (
                  <OptionItem
                    index={index}
                    field={field}
                    errors={errors}
                    onRemove={remove}
                  />
                )}
              />
            ))}

            {fullErrors?.uiOptions?.options && (
              <FieldError errors={[fullErrors.uiOptions?.options]} />
            )}
          </FieldGroup>
          <Button
            variant="secondary"
            size="sm"
            className="h-8"
            onClick={() => append({ label: "", value: "" })}
          >
            Add Option
          </Button>
        </FieldSet>
      )}
    </>
  );
}

type OptionItemProps = {
  index: number;
  field: ControllerRenderProps<FieldInput, `uiOptions.options.${number}`>;
  errors: FullErrors;
  onRemove?: (index: number) => void;
};

function OptionItem({ index, field, errors, onRemove }: OptionItemProps) {
  const error = errors?.uiOptions?.options?.[index];
  return (
    <Field data-invalid={!!error}>
      <div className="flex gap-2">
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={field.value?.label}
            onChange={(e) =>
              field.onChange({
                ...field.value,
                label: e.target.value,
              })
            }
            placeholder="Enter label"
            autoComplete="off"
          />
          <Input
            value={field.value?.value}
            onChange={(e) =>
              field.onChange({
                ...field.value,
                value: e.target.value,
              })
            }
            placeholder="Enter value"
            autoComplete="off"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="not-hover:text-foreground hover:text-destructive"
          onClick={() => onRemove?.(index)}
        >
          <XIcon />
        </Button>
      </div>
      {error && <FieldError errors={[error.label, error.value]} />}
    </Field>
  );
}
