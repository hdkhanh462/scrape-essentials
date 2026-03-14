import type { Column, Table } from "@tanstack/react-table";
import { CheckIcon, PlusIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import DialogWrapper from "@/components/dialog-wrapper";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import ScrapeConfigsDialogForm from "@/features/configs/components/scrape-configs-dialog-form";
import { useAddConfig, useImportConfigs } from "@/features/configs/hooks";
import type { ConfigInput } from "@/features/configs/types/form-input";
import type { ImportConfigsPayload } from "@/features/configs/types";
import { useDialog } from "@/hooks/use-dialog";
import { dexie, type ScrapeConfig } from "@/lib/dexie";
import { exportBlob, importFromJSON } from "@/utils/import-export";

interface DataTableToolbarProps {
  table: Table<ScrapeConfig>;
}

export function ConfigTableToolbar({ table }: DataTableToolbarProps) {
  const [importPayload, setImportPayload] = useState<ImportConfigsPayload>();

  const dialog = useDialog();
  const importConfirmDialog = useDialog();

  const { mutate: addConfig } = useAddConfig({
    onSuccess: () => {
      toast.success("Config added successfully");
      dialog.close();
    },
    onError: (error) => {
      console.error("Error adding config:", error);
      toast.error("Config add failed");
    },
  });
  const { mutate: importConfigs } = useImportConfigs({
    onSuccess: () => {
      toast.success("Import successful");
      importConfirmDialog.close();
    },
    onError: (error) => {
      console.error("Error importing configs:", error);
      toast.error("Import failed", {
        description: "Please check the file and try again.",
      });
    },
  });

  const isFiltered = table.getState().columnFilters.length > 0;

  function onSubmit(input: ConfigInput) {
    addConfig(input);
  }

  async function handleExport() {
    const allConfigs = await dexie.scrapeConfigs.toArray();
    const allConfigFields = await dexie.configFields.toArray();
    const exportData = { allConfigs, allConfigFields };
    const blob = new Blob([JSON.stringify(exportData)], {
      type: "application/json",
    });

    await exportBlob({
      blob,
      prefix: "configs-export",
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
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder="Filter configs..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-35 lg:w-62"
        />
        {table.getColumn("isActive") && (
          <DataTableFacetedFilter
            column={
              table.getColumn("isActive") as
                | Column<ScrapeConfig, boolean>
                | undefined
            }
            title="Status"
            options={[
              {
                value: true,
                label: "Active",
                icon: CheckIcon,
              },
              {
                value: false,
                label: "Inactive",
                icon: XIcon,
              },
            ]}
          />
        )}
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
          description="This action cannot be undone. This will permanently import and overwrite your existing configs."
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
                onClick={() => {
                  if (!importPayload) return;
                  importConfigs(importPayload);
                }}
              >
                Continue
              </Button>
            </Field>
          }
        />
        <DataTableViewOptions table={table} />
        <ScrapeConfigsDialogForm
          id="add-config-dialog-form"
          open={dialog.isOpen}
          onOpenChange={dialog.onChange}
          onSubmit={onSubmit}
          trigger={
            <Button size="sm" onClick={dialog.open}>
              <PlusIcon />
              Add Config
            </Button>
          }
        />
      </div>
    </div>
  );
}
