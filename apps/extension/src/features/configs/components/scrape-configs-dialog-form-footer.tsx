import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { ConfigSchema } from "@/features/configs/schemas";
import type { ConfigInput } from "@/features/configs/types/form-input";

interface Props {
  id: string;
  mode?: "add" | "edit";
  form: UseFormReturn<ConfigInput>;
}

export function ScrapeConfigsDialogFormFooter({ id, mode, form }: Props) {
  const handlePaste = () => {
    navigator.clipboard.readText().then((text) => {
      const { data, error } = ConfigSchema.safeParse(JSON.parse(text));
      if (error) {
        console.error("Error parsing config from clipboard:", error);
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
    });
  };

  return (
    <Field orientation="horizontal">
      {mode === "add" && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handlePaste()}
        >
          Paste
        </Button>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => form.reset()}
      >
        Reset
      </Button>
      <Button
        type="submit"
        size="sm"
        form={id}
        disabled={!form.formState.isDirty}
      >
        {mode === "add" ? "Add" : "Save"}
      </Button>
    </Field>
  );
}
