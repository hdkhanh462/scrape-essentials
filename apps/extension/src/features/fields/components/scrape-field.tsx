import { FormInput } from "@/components/form";
import { FieldError } from "@/components/ui/field";
import type { FieldTypePropsV2 } from "@/features/fields/types/field";

export function ScrapeField({ form, fullErrors }: FieldTypePropsV2) {
  const t = browser.i18n.getMessage;

  return (
    <>
      <FormInput
        control={form.control}
        name="scrapeOptions.cssSelector"
        label={t("cssSelector")}
        inputProps={{
          placeholder: t("enterCssSelector"),
          autoComplete: "off",
        }}
      />
      <div className="grid grid-cols-2 gap-2">
        <FormInput
          control={form.control}
          name="scrapeOptions.condition"
          label={t("condition")}
          inputProps={{
            placeholder: t("enterCondition"),
            autoComplete: "off",
          }}
        />
        <FormInput
          control={form.control}
          name="scrapeOptions.attributeName"
          label={t("attributeName")}
          inputProps={{
            placeholder: t("enterAttributeName"),
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
