import type { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const t = browser.i18n.getMessage;

  const deleteConfirmDialog = useDialog();
  const { setMode, setConfigId, showDetail } = useConfigStore(
    (state) => state.actions,
  );

  const fieldsQuery = useGetFields({ configId: row.original.id });
  const duplicateConfigMutation = useDuplicateConfig({
    onSuccess: () => {
      toast.success(t("configDuplicated"));
    },
    onError: (error) => toastError(error, t("failedToDuplicateConfig")),
  });
  const deleteConfigMutation = useDeleteConfig({
    onSuccess: () => {
      toast.success(t("configDeleted"));
      deleteConfirmDialog.close();
    },
    onError: (error) => toastError(error, t("failedToDeleteConfig")),
  });

  const handleCopyId = () => {
    navigator.clipboard.writeText(row.original.id);
    toast.success(t("configIdCopied"));
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
      toast.error(t("failedToCopyConfig"), {
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
    toast.success(t("configCopied"));
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
        <DropdownMenuItem onSelect={handleEditSelect}>
          {t("edit")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleCopyId}>
          {t("copy")} ID
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleCopyConfig}>
          {t("copy")} JSON
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => duplicateConfigMutation.mutate(row.original.id)}
        >
          {t("duplicate")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onSelect={deleteConfirmDialog.open}
        >
          {t("delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>

      <ConfirmDialog
        control={deleteConfirmDialog}
        title={t("areYouSure")}
        description={t("deleteConfigConfirmation")}
        onConfirm={() => deleteConfigMutation.mutate(row.original.id)}
      />
    </DropdownMenu>
  );
}
