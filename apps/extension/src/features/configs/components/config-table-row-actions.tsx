import type { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import DialogWrapper from "@/components/dialog-wrapper";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field } from "@/components/ui/field";
import { useDeleteConfig, useDuplicateConfig } from "@/features/configs/hooks";
import { ConfigSchema } from "@/features/configs/schemas";
import { useConfigStore } from "@/features/configs/stores/config.store";
import { useGetFields } from "@/features/fields/hooks";
import { useDialog } from "@/hooks/use-dialog";
import type { ConfigField, ScrapeConfig } from "@/lib/dexie";
import { dbFieldToFieldInput } from "@/utils/converts";
import { logger } from "@/utils/logger";

interface Props {
  row: Row<ScrapeConfig>;
}

export function ConfigTableRowActions({ row }: Props) {
  const deleteConfirmDialog = useDialog();
  const { setMode, setConfigId, showDetail } = useConfigStore(
    (state) => state.actions,
  );

  const fieldsQuery = useGetFields({ configId: row.original.id });
  const duplicateConfigMutation = useDuplicateConfig({
    onSuccess: () => {
      toast.success("Config duplicated successfully");
    },
    onError: (error) => toastError(error, "Failed to duplicate config"),
  });
  const deleteConfigMutation = useDeleteConfig({
    onSuccess: () => {
      toast.success("Config deleted successfully");
      deleteConfirmDialog.close();
    },
    onError: (error) => toastError(error, "Failed to delete config"),
  });

  const handleCopyId = () => {
    navigator.clipboard.writeText(row.original.id);
    toast.success("Config ID copied to clipboard");
  };

  const handleCopyConfig = async (_e: Event) => {
    let fields: ConfigField[] = fieldsQuery.data || [];
    if (!fields.length) {
      logger.log("Fields not loaded, refetching...");
      const { data } = await fieldsQuery.refetch();
      fields = data || [];
    }

    const configData = {
      name: row.original.name,
      isActive: row.original.isActive,
      domains: row.original.domains.map((domain) => ({
        value: domain,
      })),
      fields: fields.map((field) => dbFieldToFieldInput(field)),
    };

    logger.log("Copying config with fields:", { configData });

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
  };

  const handleEditSelect = () => {
    setConfigId(row.original.id);
    setMode("edit");
    showDetail();
  };

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
        <DropdownMenuItem onSelect={handleEditSelect}>Edit</DropdownMenuItem>
        <DropdownMenuItem onSelect={handleCopyId}>Copy ID</DropdownMenuItem>
        <DropdownMenuItem onSelect={handleCopyConfig}>
          Copy JSON
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => duplicateConfigMutation.mutate(row.original.id)}
        >
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
              onClick={() => deleteConfigMutation.mutate(row.original.id)}
            >
              Continue
            </Button>
          </Field>
        }
      />
    </DropdownMenu>
  );
}
