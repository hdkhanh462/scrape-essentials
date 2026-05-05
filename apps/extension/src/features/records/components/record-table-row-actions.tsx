import type { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
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
import { useDeleteRecord } from "@/features/records/hooks";
import { processCopyData } from "@/features/records/utils/copy";
import { useDialog } from "@/hooks/use-dialog";
import { dexie, type ScrapedRecord } from "@/lib/dexie";
import { toastError } from "@/utils/toast";

interface Props {
  row: Row<ScrapedRecord>;
}

export function RecordTableRowActions({ row }: Props) {
  const deleteConfirmDialog = useDialog();
  const copyRecord = useCopyToClipboard();
  const { mutate: deleteRecord } = useDeleteRecord();

  const handleCopyRecord = async () => {
    const config = await dexie.scrapeConfigs
      .where("id")
      .equals(row.original.configId)
      .first();
    const fields = await dexie.configFields
      .where("configId")
      .equals(row.original.configId)
      .sortBy("order");

    if (config && fields.length > 0 && row.original.data) {
      const copyData = processCopyData({
        matchConfig: { config, fields },
        scrapedData: row.original.data,
        key: row.original.key,
      });
      copyRecord.copy(copyData);
      toast.success(t("record.recordDataCopied"));
    }
  };

  const handleDeleteRecord = () => {
    deleteRecord(row.original.id, {
      onSuccess: () => {
        toast.success(t("message.recordDeletedSuccessfully"));
        deleteConfirmDialog.close();
      },
      onError: (error) => toastError(error, t("message.failedToDeleteRecord")),
    });
  };

  const handleOpenNewTab = () => {
    if (!row.original.url) {
      toast.error(t("record.urlNotFound"));
      return;
    }

    browser.tabs.create({ url: row.original.url, active: true });
  };

  const { t } = useTranslation();

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
        <DropdownMenuItem onSelect={handleCopyRecord}>
          {t("button.copy")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleOpenNewTab}>
          {t("record.gotoUrl")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={deleteConfirmDialog.open}
        >
          {t("button.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>

      <ConfirmDialog
        control={deleteConfirmDialog}
        title={t("dialog.areYouSure")}
        description={t("dialog.deleteRecordConfirmation")}
        onConfirm={handleDeleteRecord}
      />
    </DropdownMenu>
  );
}
