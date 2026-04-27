import { useWatch } from "react-hook-form";
import type { FieldTypePropsV2 } from "@/features/fields/types/field";

export default function CheckboxFields({ form }: FieldTypePropsV2) {
  const t = browser.i18n.getMessage;

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
        label={t("showOnTable")}
      />
      <FormCheckbox
        control={form.control}
        name="isFilterable"
        label={t("filterable")}
      />
      <FormCheckbox
        control={form.control}
        name="isRequired"
        label={t("required")}
        inputProps={{ disabled: isPrimary }}
      />
      {(isScrapeFieldType(type) || isPageUrlFieldType(type)) && (
        <FormCheckbox
          control={form.control}
          name="isPrimary"
          label={t("primary")}
        />
      )}
      {isScrapeFieldType(type) && (
        <>
          <FormCheckbox
            control={form.control}
            name="scrapeOptions.isMultiple"
            label={t("multiple")}
          />
          <FormCheckbox
            control={form.control}
            name="isParent"
            label={t("parent")}
          />
        </>
      )}
    </div>
  );
}
