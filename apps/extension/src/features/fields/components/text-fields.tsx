import { XIcon } from "lucide-react";
import { Controller, useFieldArray } from "react-hook-form";
import { useTranslation } from "react-i18next";
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
import type { FieldTypePropsV2 } from "@/features/fields/types/field";

export default function TextFields({ form, fullErrors }: FieldTypePropsV2) {
  const { t } = useTranslation();

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
          label={t("field.regexPattern")}
          inputProps={{
            placeholder: t("field.enterRegexPattern"),
            autoComplete: "off",
          }}
        />
        <FormInput
          control={form.control}
          name="splitter"
          label={t("field.splitter")}
          inputProps={{
            placeholder: t("field.enterSplitter"),
            autoComplete: "off",
          }}
        />
        {(fullErrors?.regex || fullErrors?.splitter) && (
          <FieldError errors={[fullErrors?.regex, fullErrors?.splitter]} />
        )}
      </div>
      <FieldSet>
        <FieldLegend className="text-sm!">{t("field.removers")}</FieldLegend>
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
                      placeholder={t("field.enterRemover")}
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
          type="button"
          variant="secondary"
          size="sm"
          className="h-8"
          onClick={() => append({ value: "" })}
        >
          {t("field.addRemover")}
        </Button>
      </FieldSet>
    </>
  );
}
