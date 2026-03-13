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
import { useGetFields } from "@/features/fields/hooks";
import ScrapeConfigsDialogForm from "@/features/scrape-configs/components/scrape-configs-dialog-form";
import { configApi } from "@/features/scrape-configs/data/config.api";
import { configSchema } from "@/features/scrape-configs/schemas/form-input";
import type { ConfigInput } from "@/features/scrape-configs/types/form-input";
import { useDialog } from "@/hooks/use-dialog";
import type { ScrapeConfig } from "@/lib/dexie";

interface Props {
  row: Row<ScrapeConfig>;
}

export function ConfigTableRowActions({ row }: Props) {
  const deleteConfirmDialog = useDialog();

  const [editConfig] = configApi.useEditConfigMutation({});
  const [duplicateConfig] = configApi.useDuplicateConfigMutation({});
  const [deleteConfig] = configApi.useDeleteConfigMutation({});

  const { data: originalFields } = useGetFields({ configId: row.original.id });

  async function handleSubmit(data: ConfigInput) {
    const { error } = await editConfig({ id: row.original.id, data });
    if (error) {
      console.error("Error editing config:", error);
      toast.error("Config update failed");
      return;
    }

    toast.success("Config updated successfully");
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
      fields: originalFields?.map((field) => dbFieldToFieldInput(field)),
    };
    const result = configSchema.safeParse(configData);
    if (!result.success) {
      console.error("Error copying config:", result.error);
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
                onClick={deleteConfirmDialog.close}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={async () => {
                  await deleteConfig(row.original.id).unwrap();
                  deleteConfirmDialog.close();
                }}
              >
                Continue
              </Button>
            </Field>
          }
        />
        <DropdownMenuItem
          variant="destructive"
          onSelect={(e) => {
            e.preventDefault();
            deleteConfirmDialog.open();
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
