import type { PropsWithChildren } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

type DialogFooterProps = PropsWithChildren<{
  formId: string;
  isDirty?: boolean;
  submitText?: string;
  onReset?: () => void;
}>;

export function DialogFooter({
  formId,
  isDirty,
  submitText = "Submit",
  children,
  onReset,
}: DialogFooterProps) {
  return (
    <Field orientation="horizontal">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onReset?.()}
      >
        Reset
      </Button>
      <Button type="submit" size="sm" form={formId} disabled={!isDirty}>
        {submitText}
      </Button>
      {children}
    </Field>
  );
}
