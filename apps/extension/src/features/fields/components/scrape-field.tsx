import { useTranslation } from "react-i18next";
import { FormInput } from "@/components/form";
import { FieldError } from "@/components/ui/field";
import type { FieldTypePropsV2 } from "@/features/fields/types/field";

export function ScrapeField({ form, fullErrors }: FieldTypePropsV2) {
  const { t } = useTranslation();

  return (
    <>
      <FormInput
        control={form.control}
        name="scrapeOptions.cssSelector"
        label={t("field.cssSelector")}
        inputProps={{
          placeholder: t("field.enterCssSelector"),
          autoComplete: "off",
        }}
      />
      <div className="grid grid-cols-2 gap-2">
        <FormInput
          control={form.control}
          name="scrapeOptions.condition"
          label={t("field.condition")}
          inputProps={{
            placeholder: t("field.enterCondition"),
            autoComplete: "off",
          }}
        />
        <FormInput
          control={form.control}
          name="scrapeOptions.attributeName"
          label={t("field.attributeName")}
          inputProps={{
            placeholder: t("field.enterAttributeName"),
            autoComplete: "off",
          }}
        />
        {(fullErrors?.scrapeOptions?.condition ||
          fullErrors?.scrapeOptions?.attributeName) && (
          <FieldError
            errors={[
              fullErrors?.scrapeOptions?.condition,
              fullErrors?.scrapeOptions?.attributeName,
            ]}
          />
        )}
      </div>
    </>
  );
}
