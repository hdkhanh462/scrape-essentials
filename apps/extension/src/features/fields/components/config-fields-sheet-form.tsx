import { zodResolver } from "@hookform/resolvers/zod";
import { type SubmitHandler, useForm, useWatch } from "react-hook-form";

import type { DialogWrapperProps } from "@/components/dialog-wrapper";
import { FormInput, FormSelect } from "@/components/form";
import SheetWrapper from "@/components/sheet-wrapper";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { SelectItem } from "@/components/ui/select";
import CheckboxFields from "@/features/fields/components/checkbox-fields";
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
import { DialogFooter } from "@/features/shared/components/dialog-footer";
import { FieldType } from "@/lib/dexie";

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
  formId: string;
  field?: FieldInput;
  onSubmit?: (input: FieldInput) => Promise<void>;
};

export default function ConfigFieldsSheetForm({
  formId,
  field,
  onSubmit,
  ...props
}: Props) {
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
      {...props}
      title={field ? "Edit Field" : "Add Field"}
      footer={
        <DialogFooter
          formId={formId}
          isDirty={form.formState.isDirty}
          submitText={field ? "Save" : "Add"}
          onReset={form.reset}
        />
      }
    >
      <form
        id={formId}
        className="px-4"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FieldGroup>
          <div className="grid grid-cols-2 gap-2">
            <FormInput
              control={form.control}
              name="name"
              label="Field Name"
              hideError
              inputProps={{
                placeholder: "Enter field name",
                autoComplete: "off",
              }}
            />
            <FormSelect
              control={form.control}
              name="type"
              label="Field Type"
              inputProps={{
                placeholder: "Select field type",
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
}
