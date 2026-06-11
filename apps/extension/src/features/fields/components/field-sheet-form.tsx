import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { type SubmitHandler, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { DialogWrapperProps } from "@/components/dialog-wrapper";
import { FormInput, FormSelect } from "@/components/form";
import { SheetWrapper } from "@/components/sheet-wrapper";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { SelectItem } from "@/components/ui/select";
import CheckboxFields from "@/features/fields/components/checkbox-fields";
import { FieldSheetFooter } from "@/features/fields/components/field-sheet-footer";
import { ScrapeField } from "@/features/fields/components/scrape-field";
import SelectorFields from "@/features/fields/components/selector-fields";
import TextFields from "@/features/fields/components/text-fields";
import { UiField } from "@/features/fields/components/ui-field";
import { typeLabels } from "@/features/fields/constants";
import { FieldSchema } from "@/features/fields/schemas";
import type {
  FieldInput,
  FullErrors,
} from "@/features/fields/types/form-input";
import type { useDialog } from "@/hooks/use-dialog";
import { FieldType } from "@/lib/dexie";
import {
  isInputFieldType,
  isScrapeFieldType,
  isSelectFieldType,
} from "@/utils/config-field";

const DEFAULT_VALUES: FieldInput = {
  name: "",
  order: 0,
  type: FieldType.Text,
  parentFieldId: "",
  isShowOnTable: true,
  isFilterable: true,
  isRequired: false,
  isPrimary: false,
  regex: "",
  spliter: "",
  scrapeOptions: {
    cssSelector: "",
    attributeName: "",
    condition: "",
    isMultiple: false,
  },
};

type Props = Omit<DialogWrapperProps, "title"> & {
  control: ReturnType<typeof useDialog>;
  formId: string;
  field?: FieldInput;
  onSubmit?: (input: FieldInput) => Promise<void>;
};

export const FieldSheetForm: React.FC<Props> = (props) => {
  const { control, formId, field, onSubmit, ...rest } = props;

  const { t } = useTranslation();
  const form = useForm<FieldInput>({
    resolver: zodResolver(FieldSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const type = useWatch({
    control: form.control,
    name: "type",
  });
  const isPrimary = useWatch({
    control: form.control,
    name: "isPrimary",
  });

  useEffect(() => {
    if (isPrimary) {
      form.setValue("isRequired", true, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [form, isPrimary]);

  useEffect(() => {
    if (field) form.reset(field);
  }, [field, form]);

  const fullErrors: FullErrors = form.formState.errors;
  const handleSubmit: SubmitHandler<FieldInput> = async (input) => {
    await onSubmit?.(input);
    if (!field) form.reset(DEFAULT_VALUES);
    else form.reset(input);
  };

  return (
    <SheetWrapper
      {...rest}
      open={control.isOpen}
      onOpenChange={control.onChange}
      title={
        field
          ? `${t("button.edit")} ${t("field.label")}`
          : `${t("button.add")} ${t("field.label")}`
      }
      footer={
        <FieldSheetFooter
          id={formId}
          form={form}
          mode={field ? "edit" : "add"}
        />
      }
    >
      <form
        id={formId}
        className="px-4"
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(handleSubmit)(e);
        }}
      >
        <FieldGroup>
          <div className="grid grid-cols-2 gap-2">
            <FormInput
              control={form.control}
              name="name"
              label={t("field.fieldName")}
              hideError
              inputProps={{
                placeholder: t("field.enterFieldName"),
                autoComplete: "off",
              }}
            />
            <FormSelect
              control={form.control}
              name="type"
              label={t("field.fieldType")}
              inputProps={{
                children: Object.values(FieldType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {typeLabels[type]}
                  </SelectItem>
                )),
              }}
            />
            {(fullErrors?.name || fullErrors?.type) && (
              <FieldError errors={[fullErrors?.name, fullErrors?.type]} />
            )}
          </div>
          <CheckboxFields form={form} />

          {!isInputFieldType(type) && !isSelectFieldType(type) && (
            <TextFields form={form} />
          )}
          {isScrapeFieldType(type) && <ScrapeField form={form} />}
          {(isInputFieldType(type) || isSelectFieldType(type)) && (
            <UiField form={form} fullErrors={fullErrors} />
          )}
          {isScrapeFieldType(type) && <SelectorFields form={form} />}
        </FieldGroup>
      </form>
    </SheetWrapper>
  );
};
