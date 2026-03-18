import { DataTable } from "@/components/data-table/data-table";
import { useGetFields } from "@/features/fields/hooks";
import { ConfigSelector } from "@/features/records/components/config-selector";
import { RecordTableToolbar } from "@/features/records/components/record-table-toolbar";
import { useGetRecords } from "@/features/records/hooks";
import { useRecordStore } from "@/features/records/stores/record.store";
import { advancedGlobalFilter } from "@/features/records/utils/filter";
import { buildColumn } from "@/features/records/utils/table";
import { useColumnVisibility } from "@/utils/table";

export function RecordsContainer() {
  const { configId, filterString } = useRecordStore();
  const columnVisibility = useColumnVisibility();

  const { data: fields } = useGetFields({
    configId,
    isShowOnTable: true,
  });
  const { data: records } = useGetRecords({ configId });

  const columns = useMemo(() => buildColumn(fields ?? []), [fields]);

  return (
    <div className="space-y-4">
      <ConfigSelector />
      <DataTable
        columns={columns}
        data={records ?? []}
        globalFilter={filterString}
        globalFilterFn={advancedGlobalFilter}
        columnVisibility={columnVisibility.value}
        onColumnVisibilityChange={columnVisibility.onChange}
      >
        {(table) => <RecordTableToolbar table={table} />}
      </DataTable>
    </div>
  );
}
