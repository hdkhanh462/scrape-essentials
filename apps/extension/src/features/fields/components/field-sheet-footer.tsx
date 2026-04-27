import { CheckIcon, ClipboardPasteIcon, CopyIcon } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FieldSchema } from "@/features/fields/schemas";
import type { FieldInput } from "@/features/fields/types/form-input";
import { usePasteFromClipboard } from "@/hooks/use-paste-from-clipboard";
import { logger } from "@/utils/logger";

interface Props {
  id: string;
  mode?: "add" | "edit";
  form: UseFormReturn<FieldInput>;
}

export function FieldSheetFooter({ id, mode, form }: Props) {
  const t = browser.i18n.getMessage;

  const copyField = useCopyToClipboard();
  const pasteField = usePasteFromClipboard({
    onPaste: (text) => {
      let valueFromClipboard: unknown;

      try {
        valueFromClipboard = JSON.parse(text);
      } catch (error) {
        toast.error(t("invalidJsonFormat"), {
          description: error instanceof Error ? error.message : "Unknown error",
        });
        return;
      }

      const { data, error } = FieldSchema.safeParse(valueFromClipboard);
      if (error) {
        logger.error("Error parsing field from clipboard:", error);
        toast.error(t("pasteFailed"), {
          description: () => (
            <ul>
              {error.issues.map((err) => (
                <li key={err.code}>
                  {err.path.join(".")}: {err.message}
                </li>
              ))}
            </ul>
          ),
        });
        return;
      }
      form.reset(data, {
        keepDefaultValues: true,
      });
    },
  });

  const handleCopy = () => {
    const data = form.getValues();
    copyField.copy(JSON.stringify(data));
  };

  return (
    <Field orientation="horizontal">
      {mode === "add" ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          onClick={pasteField.paste}
        >
          <Loader
            isLoading={pasteField.isPasted}
            fallback={
              <>
                <CheckIcon />
                {t("pasted")}
              </>
            }
          >
            <ClipboardPasteIcon />
            {t("paste")}
          </Loader>
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          onClick={handleCopy}
        >
          <Loader
            isLoading={copyField.isCopied}
            fallback={
              <>
                <CheckIcon />
                {t("copied")}
              </>
            }
          >
            <CopyIcon />
            {t("copy")}
          </Loader>
        </Button>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8"
        onClick={() => form.reset()}
      >
        {t("reset")}
      </Button>
      <Button
        form={id}
        type="submit"
        size="sm"
        className="h-8"
        disabled={!form.formState.isDirty}
      >
        {mode === "add" ? t("add") : t("save")}
      </Button>
    </Field>
  );
}
