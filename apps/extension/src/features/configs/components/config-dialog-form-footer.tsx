import { CheckIcon, ClipboardPasteIcon } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { ConfigSchema } from "@/features/configs/schemas";
import type { ConfigInput } from "@/features/configs/types/form-input";
import { logger } from "@/utils/logger";

interface Props {
  id: string;
  mode?: "add" | "edit";
  form: UseFormReturn<ConfigInput>;
}

export function ConfigDialogFormFooter({ id, mode, form }: Props) {
  const pasteConfig = usePasteFromClipboard({
    onPaste: (text) => {
      let valueFromClipboard: unknown;

      try {
        valueFromClipboard = JSON.parse(text);
      } catch (error) {
        toast.error("Invalid JSON format in clipboard", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
        return;
      }

      const { data, error } = ConfigSchema.safeParse(valueFromClipboard);
      if (error) {
        logger.error("Error parsing config from clipboard:", error);
        toast.error("Paste failed", {
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

  return (
    <Field orientation="horizontal">
      {mode === "add" && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          onClick={pasteConfig.paste}
        >
          <Loader
            isLoading={pasteConfig.isPasted}
            fallback={
              <>
                <CheckIcon />
                Pasted
              </>
            }
          >
            <ClipboardPasteIcon />
            Paste
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
        Reset
      </Button>
      <Button
        type="submit"
        size="sm"
        className="h-8"
        form={id}
        disabled={!form.formState.isDirty}
      >
        {mode === "add" ? "Add" : "Save"}
      </Button>
    </Field>
  );
}
