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
import { recordApi } from "@/features/scraped-records/data/record.api";
import { processCopyData } from "@/features/scraped-records/utils/copy";
import { useDialog } from "@/hooks/use-dialog";
import { dexie, type ScrapedRecord } from "@/lib/dexie";

interface Props {
  row: Row<ScrapedRecord>;
}

export function RecordTableRowActions({ row }: Props) {
  const deleteConfirmDialog = useDialog();
  const { copyToClipboard } = useCopyToClipboard();
  const [deleteRecord] = recordApi.useDeleteScrapedRecordMutation();

  async function handleCopyRecord() {
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
      copyToClipboard(copyData);
      toast.success("Record copied to clipboard");
    }
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
        <DropdownMenuItem onSelect={handleCopyRecord}>Copy</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DialogWrapper
          title="Are you absolutely sure?"
          description="This action cannot be undone. This will permanently delete your
          selected record."
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
                  await deleteRecord(row.original.id).unwrap();
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
