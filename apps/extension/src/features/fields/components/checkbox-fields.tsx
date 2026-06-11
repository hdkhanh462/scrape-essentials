import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormCheckbox } from "@/components/form";
import type { FieldTypePropsV2 } from "@/features/fields/types/field";
import { isPageUrlFieldType, isScrapeFieldType } from "@/utils/config-field";

export default function CheckboxFields({ form }: FieldTypePropsV2) {
  const { t } = useTranslation();

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
        label={t("field.showOnTable")}
      />
      <FormCheckbox
        control={form.control}
        name="isFilterable"
        label={t("field.filterable")}
      />
      <FormCheckbox
        control={form.control}
        name="isRequired"
        label={t("field.required")}
        inputProps={{ disabled: isPrimary }}
      />
      {(isScrapeFieldType(type) || isPageUrlFieldType(type)) && (
        <FormCheckbox
          control={form.control}
          name="isPrimary"
          label={t("field.primary")}
        />
      )}
      {isScrapeFieldType(type) && (
        <>
          <FormCheckbox
            control={form.control}
            name="scrapeOptions.isMultiple"
            label={t("field.multiple")}
          />
          <FormCheckbox
            control={form.control}
            name="isParent"
            label={t("field.parent")}
          />
        </>
      )}
    </div>
  );
}
