import type { Column, Table } from "@tanstack/react-table";
import { CheckIcon, PlusIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useImportConfigs } from "@/features/configs/hooks";
import { useConfigStore } from "@/features/configs/stores/config.store";
import type { ImportConfigsPayload } from "@/features/configs/types";
import { useDialog } from "@/hooks/use-dialog";
import { dexie, type ScrapeConfig } from "@/lib/dexie";
import { exportBlob, importFromJSON } from "@/utils/import-export";

interface DataTableToolbarProps {
  table: Table<ScrapeConfig>;
}

export function ConfigTableToolbar({ table }: DataTableToolbarProps) {
  const [importPayload, setImportPayload] = useState<ImportConfigsPayload>();

  const importConfirmDialog = useDialog();
  const { setMode, setConfigId, showDetail } = useConfigStore(
    (state) => state.actions,
  );

  const importConfigsMutation = useImportConfigs({
    onSuccess: () => {
      toast.success("Import successful");
      importConfirmDialog.close();
    },
    onError: (error) => toastError(error, "Failed to import configs"),
  });

  const isFiltered = table.getState().columnFilters.length > 0;

  const handleExport = async () => {
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
  };

  const handleImport = async () => {
    await importFromJSON(async (file) => {
      const text = await file.text();
      const data = JSON.parse(text);
      setImportPayload(data);
      importConfirmDialog.open();
    });
  };

  const handleAddConfigClick = () => {
    setMode("add");
    setConfigId(null);
    showDetail();
  };

  const handleImportConfirm = () => {
    if (!importPayload) return;
    importConfigsMutation.mutate(importPayload);
  };

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
          onClick={handleImport}
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
        <ConfirmDialog
          control={importConfirmDialog}
          title="Are you absolutely sure?"
          description="This action cannot be undone. This will permanently import and overwrite your existing configs."
          onConfirm={handleImportConfirm}
        />
        <DataTableViewOptions table={table} />
        <Button size="sm" className="h-8" onClick={handleAddConfigClick}>
          <PlusIcon />
          Add Config
        </Button>
      </div>
    </div>
  );
}
