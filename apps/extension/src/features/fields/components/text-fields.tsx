import { XIcon } from "lucide-react";
import { Controller, useFieldArray } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { FieldTypePropsV2 } from "@/features/fields/types/field";

export default function TextFields({ form, fullErrors }: FieldTypePropsV2) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "removers",
  });

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <FormInput
          control={form.control}
          name="regex"
          label="Regex Pattern"
          inputProps={{
            placeholder: "Enter regex pattern",
            autoComplete: "off",
          }}
        />
        <FormInput
          control={form.control}
          name="spliter"
          label="Spliter"
          inputProps={{
            placeholder: "Enter spliter",
            autoComplete: "off",
          }}
        />
        {(fullErrors?.regex || fullErrors?.spliter) && (
          <FieldError errors={[fullErrors?.regex, fullErrors?.spliter]} />
        )}
      </div>
      <FieldSet>
        <FieldLegend className="text-sm!">Removers</FieldLegend>
        <FieldGroup className="gap-3">
          {fields.map((item, index) => (
            <Controller
              key={item.id}
              name={`removers.${index}.value`}
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex gap-2">
                    <Input
                      {...field}
                      placeholder="Enter remover"
                      autoComplete="off"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="not-hover:text-foreground hover:text-destructive"
                      onClick={() => remove(index)}
                    >
                      <XIcon />
                    </Button>
                  </div>
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          ))}
        </FieldGroup>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => append({ value: "" })}
        >
          Add Remover
        </Button>
      </FieldSet>
    </>
  );
}
