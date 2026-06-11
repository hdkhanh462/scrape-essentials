import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DataTable } from "@/components/data-table/data-table";
import { useGetFields } from "@/features/fields/hooks";
import { ConfigSelector } from "@/features/records/components/config-selector";
import { RecordTableToolbar } from "@/features/records/components/record-table-toolbar";
import {
  useDeleteMultipleRecords,
  useGetRecordById,
  useGetRecords,
} from "@/features/records/hooks";
import { useRecordStore } from "@/features/records/stores/record.store";
import { advancedGlobalFilter } from "@/features/records/utils/filter";
import { buildColumn } from "@/features/records/utils/table";
import { useDialog } from "@/hooks/use-dialog";
import type { ScrapedRecord } from "@/lib/dexie";
import { useColumnVisibility } from "@/utils/table";

export function RecordContainer() {
  const [rowSelection, setRowSelection] = useState({});
  const [selectedIds, setSelectedIds] = useState<ScrapedRecord["id"][]>([]);

  const { t } = useTranslation();
  const deleteConfirmDialog = useDialog();

  const { configId, filterString } = useRecordStore();
  const columnVisibility = useColumnVisibility();

  const { data: config } = useGetRecordById({ id: configId });
  const { data: fields } = useGetFields({
    configId,
    isShowOnTable: true,
  });
  const { data: records } = useGetRecords({ configId });
  const deleteRecordsMutation = useDeleteMultipleRecords({
    onSuccess: () => {
      setSelectedIds([]);
      setRowSelection({});
      deleteConfirmDialog.close();
      toast.success(t("message.recordsDeletedSuccessfully"));
    },
  });

  const columns = useMemo(
    () => buildColumn(config?.url || "", fields || []),
    [fields, config],
  );

  const handleDeleteSelected = (ids: ScrapedRecord["id"][]) => {
    deleteConfirmDialog.open();
    setSelectedIds(ids);
  };

  return (
    <div className="space-y-4">
      <ConfigSelector />
      <DataTable
        columns={columns}
        data={records ?? []}
        globalFilter={filterString}
        globalFilterFn={advancedGlobalFilter}
        columnVisibility={columnVisibility.value}
        rowSelection={rowSelection}
        onColumnVisibilityChange={columnVisibility.onChange}
        onRowSelectionChange={setRowSelection}
      >
        {(table) => (
          <RecordTableToolbar
            table={table}
            onDeleteSelected={handleDeleteSelected}
          />
        )}
      </DataTable>
      <ConfirmDialog
        control={deleteConfirmDialog}
        title={t("dialog.areYouSure")}
        description={t("dialog.deleteRecordsConfirmation")}
        onConfirm={() => deleteRecordsMutation.mutate(selectedIds)}
      />
    </div>
  );
}
