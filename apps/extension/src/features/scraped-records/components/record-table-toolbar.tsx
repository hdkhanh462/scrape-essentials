import type { Table } from "@tanstack/react-table";
import { XIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
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
import { recordApi } from "@/features/scraped-records/data/record.api";
import { selectFilterString } from "@/features/scraped-records/store/record.selectors";
import { setFilterString } from "@/features/scraped-records/store/record.slice";
import { useDialog } from "@/hooks/use-dialog";
import { dexie, type ScrapedRecord } from "@/lib/dexie";
import { exportBlob, importFromJSON } from "@/utils/import-export";

interface DataTableToolbarProps {
  table: Table<ScrapedRecord>;
}

export function RecordTableToolbar({ table }: DataTableToolbarProps) {
  const dispatch = useDispatch();
  const filterString = useSelector(selectFilterString);

  const [importPayload, setImportPayload] = useState<ScrapedRecord[]>();
  const [filterValue, setFilterValue] = useState(filterString);

  const importConfirmDialog = useDialog();
  const [importRecords] = recordApi.useImportRecordsMutation();

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
    toast.success("Export successful");
  }

  async function handleImport() {
    await importFromJSON(async (file) => {
      const text = await file.text();
      const data = JSON.parse(text);
      setImportPayload(data);
      importConfirmDialog.open();
    });
  }

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
                  dispatch(setFilterString(undefined));
                }}
              >
                <XIcon className="text-destructive" />
              </InputGroupButton>
            )}
            <InputGroupButton
              variant="secondary"
              onClick={() => dispatch(setFilterString(filterValue))}
            >
              Search
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
          >
            Reset
            <XIcon />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={handleImport}>
          Import
        </Button>
        <Button size="sm" variant="outline" onClick={handleExport}>
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
                onClick={importConfirmDialog.close}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={async () => {
                  if (!importPayload) return;
                  const { error } = await importRecords(importPayload);
                  if (error) {
                    console.error("Error importing records:", error);
                    toast.error("Import failed", {
                      description: "Please check the file and try again.",
                    });
                    return;
                  }
                  toast.success("Import successful");
                  importConfirmDialog.close();
                }}
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
