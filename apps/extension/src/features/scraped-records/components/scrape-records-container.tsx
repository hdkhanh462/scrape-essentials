import { useSelector } from "react-redux";

import { DataTable } from "@/components/data-table/data-table";
import { useGetFields } from "@/features/fields/hooks";
import { ConfigSelector } from "@/features/scraped-records/components/config-selector";
import { RecordTableToolbar } from "@/features/scraped-records/components/record-table-toolbar";
import { recordApi } from "@/features/scraped-records/data/record.api";
import {
  selectConfigId,
  selectFilterString,
} from "@/features/scraped-records/store/record.selectors";
import { advancedGlobalFilter } from "@/features/scraped-records/utils/filter";
import { buildColumn } from "@/features/scraped-records/utils/table";

export function RecordsContainer() {
  const configId = useSelector(selectConfigId);
  const filterString = useSelector(selectFilterString);

  const { data: fields } = useGetFields({
    configId,
    isShowOnTable: true,
  });
  const { data: records } = recordApi.useGetScrapedRecordsQuery({ configId });

  const columns = useMemo(() => buildColumn(fields ?? []), [fields]);

  return (
    <div className="space-y-4">
      <ConfigSelector />
      <DataTable
        columns={columns}
        data={records ?? []}
        globalFilter={filterString}
        globalFilterFn={advancedGlobalFilter}
      >
        {(table) => <RecordTableToolbar table={table} />}
      </DataTable>
    </div>
  );
}
