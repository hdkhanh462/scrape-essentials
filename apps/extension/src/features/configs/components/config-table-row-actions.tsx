import type { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import DialogWrapper from "@/components/dialog-wrapper";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field } from "@/components/ui/field";
import ScrapeConfigsDialogForm from "@/features/configs/components/scrape-configs-dialog-form";
import {
  useDeleteConfig,
  useDuplicateConfig,
  useEditConfig,
} from "@/features/configs/hooks";
import { ConfigSchema } from "@/features/configs/schemas";
import type { ConfigInput } from "@/features/configs/types/form-input";
import { useGetFields } from "@/features/fields/hooks";
import { useDialog } from "@/hooks/use-dialog";
import type { ScrapeConfig } from "@/lib/dexie";
import { dbFieldToFieldInput } from "@/utils/convers";
import { logger } from "@/utils/logger";

interface Props {
  row: Row<ScrapeConfig>;
}

export function ConfigTableRowActions({ row }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  const deleteConfirmDialog = useDialog();

  const { mutate: editConfig } = useEditConfig({
    onSuccess: () => {
      toast.success("Config updated successfully");
    },
    onError: (error) => toastError(error, "Failed to update config"),
  });
  const { mutate: duplicateConfig } = useDuplicateConfig({
    onSuccess: () => {
      toast.success("Config duplicated successfully");
    },
    onError: (error) => toastError(error, "Failed to duplicate config"),
  });
  const { mutate: deleteConfig } = useDeleteConfig({
    onSuccess: () => {
      toast.success("Config deleted successfully");
      deleteConfirmDialog.close();
    },
    onError: (error) => toastError(error, "Failed to delete config"),
  });

  const { data: originalFields } = useGetFields(
    { configId: row.original.id },
    { enabled: modalOpen },
  );

  function handleSubmit(data: ConfigInput) {
    editConfig({ id: row.original.id, data });
  }

  function handleCopyId() {
    navigator.clipboard.writeText(row.original.id);
    toast.success("Config ID copied to clipboard");
  }

  function handleCopyConfig(_e: Event) {
    const configData = {
      name: row.original.name,
      isActive: row.original.isActive,
      domains: row.original.domains.map((domain) => ({
        value: domain,
      })),
      fields: originalFields?.map((field) => dbFieldToFieldInput(field)) || [],
    };
    const result = ConfigSchema.safeParse(configData);
    if (!result.success) {
      logger.error("Error copying config:", result.error);
      toast.error("Failed to copy config", {
        description: () => (
          <ul>
            {result.error.issues.map((err) => (
              <li key={err.code}>
                {err.path.join(".")}: {err.message}
              </li>
            ))}
          </ul>
        ),
      });
      return;
    }
    navigator.clipboard.writeText(JSON.stringify(result.data));
    toast.success("Config copied to clipboard");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 data-[state=open]:bg-muted"
        >
          <MoreHorizontal />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <ScrapeConfigsDialogForm
          id="edit-config-dialog-form"
          configId={row.original.id}
          config={{
            ...row.original,
            domains: row.original.domains.map((domain) => ({ value: domain })),
            fields: originalFields
              ? originalFields.map((field) =>
                  dbFieldToFieldInput(field, field.id),
                )
              : [],
          }}
          onSubmit={handleSubmit}
          onOpenChange={setModalOpen}
          trigger={
            <DialogTrigger type="button" className="w-full">
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Edit
              </DropdownMenuItem>
            </DialogTrigger>
          }
        />

        <DropdownMenuItem onSelect={handleCopyId}>Copy ID</DropdownMenuItem>
        <DropdownMenuItem onSelect={handleCopyConfig}>
          Copy JSON
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => duplicateConfig(row.original.id)}>
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onSelect={deleteConfirmDialog.open}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>

      <DialogWrapper
        title="Are you absolutely sure?"
        description="This action cannot be undone. This will permanently delete your
          selected config."
        open={deleteConfirmDialog.isOpen}
        onOpenChange={deleteConfirmDialog.onChange}
        footer={
          <Field orientation="horizontal">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              onClick={deleteConfirmDialog.close}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-8"
              onClick={() => deleteConfig(row.original.id)}
            >
              Continue
            </Button>
          </Field>
        }
      />
    </DropdownMenu>
  );
}
