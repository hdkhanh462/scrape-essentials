import type { Table } from "@tanstack/react-table";
import { XIcon } from "lucide-react";
import { toast } from "sonner";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import DialogWrapper from "@/components/dialog-wrapper";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useImportRecords } from "@/features/records/hooks";
import { useRecordStore } from "@/features/records/stores/record.store";
import { useDialog } from "@/hooks/use-dialog";
import { dexie, type ScrapedRecord } from "@/lib/dexie";
import { exportBlob, importFromJSON } from "@/utils/import-export";
import { toastError } from "@/utils/toast";

interface DataTableToolbarProps {
  table: Table<ScrapedRecord>;
}

export function RecordTableToolbar({ table }: DataTableToolbarProps) {
  const { filterString, setFilterString } = useRecordStore();

  const [importPayload, setImportPayload] = useState<ScrapedRecord[]>();
  const [filterValue, setFilterValue] = useState(filterString);

  const importConfirmDialog = useDialog();
  const { mutate: importRecords } = useImportRecords();

  const isFiltered = table.getState().columnFilters.length > 0;

  async function handleExport() {
    const records = await dexie.scrapedRecords.toArray();
    const blob = new Blob([JSON.stringify(records)], {
      type: "application/json",
    });
    await exportBlob({
      blob,
      prefix: "records-export",
    });
    toast.success("Export records successful");
  }

  async function handleImportClick() {
    await importFromJSON(async (file) => {
      const text = await file.text();
      const data = JSON.parse(text);
      setImportPayload(data);
      importConfirmDialog.open();
    });
  }

  const handleImportConfirm = async () => {
    if (!importPayload) return;

    importRecords(importPayload, {
      onSuccess: () => {
        toast.success("Import records successful");
        importConfirmDialog.close();
      },
      onError: (error) => toastError(error, "Import records failed"),
    });
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-1 items-center gap-2">
        <InputGroup className="w-full max-w-md">
          <InputGroupInput
            placeholder="Name:john & Age>18 | Name:jane & Age>25"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
          <InputGroupAddon align="inline-end">
            {filterValue && (
              <InputGroupButton
                variant="ghost"
                size="icon-xs"
                onClick={() => {
                  setFilterValue("");
                  setFilterString(undefined);
                }}
              >
                <XIcon className="text-destructive" />
              </InputGroupButton>
            )}
            <InputGroupButton
              variant="secondary"
              onClick={() => setFilterString(filterValue)}
            >
              Search
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => table.resetColumnFilters()}
          >
            Reset
            <XIcon />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={handleImportClick}
        >
          Import
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={handleExport}
        >
          Export
        </Button>
        <DialogWrapper
          title="Are you absolutely sure?"
          description="This action cannot be undone. This will permanently import and overwrite your existing records."
          open={importConfirmDialog.isOpen}
          onOpenChange={importConfirmDialog.onChange}
          footer={
            <Field orientation="horizontal">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8"
                onClick={importConfirmDialog.close}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-8"
                onClick={handleImportConfirm}
              >
                Continue
              </Button>
            </Field>
          }
        />
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
