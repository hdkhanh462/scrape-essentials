import { FormInput } from "@/components/form";
import { FieldError } from "@/components/ui/field";
import type { FieldTypePropsV2 } from "@/features/fields/types/field";

export function ScrapeField({ form, fullErrors }: FieldTypePropsV2) {
  return (
    <>
      <FormInput
        control={form.control}
        name="scrapeOptions.cssSelector"
        label="CSS Selector"
        inputProps={{
          placeholder: "Enter CSS selector",
          autoComplete: "off",
        }}
      />
      <div className="grid grid-cols-2 gap-2">
        <FormInput
          control={form.control}
          name="scrapeOptions.condition"
          label="Condition"
          inputProps={{
            placeholder: "Enter condition",
            autoComplete: "off",
          }}
        />
        <FormInput
          control={form.control}
          name="scrapeOptions.attributeName"
          label="Attribute Name"
          inputProps={{
            placeholder: "Enter attribute name",
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
