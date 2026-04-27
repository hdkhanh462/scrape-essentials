import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { BadgeOverflow } from "@/components/ui/badge-overflow";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfigActiveCell } from "@/features/configs/components/config-active-cell";
import { ConfigDetail } from "@/features/configs/components/config-detail";
import { ConfigTableRowActions } from "@/features/configs/components/config-table-row-actions";
import { ConfigTableToolbar } from "@/features/configs/components/config-table-toolbar";
import { useGetConfigs } from "@/features/configs/hooks";
import { useConfigStore } from "@/features/configs/stores/config.store";
import type { ScrapeConfig } from "@/lib/dexie";
import { useColumnVisibility } from "@/utils/table";

export function ConfigContainer() {
  const t = browser.i18n.getMessage;

  const { data } = useGetConfigs({});
  const { showDetail } = useConfigStore();
  const columnVisibility = useColumnVisibility();

  const columns: ColumnDef<ScrapeConfig>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("configName")} />
      ),
    },
    {
      accessorKey: "domains",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("domains")} />
      ),
      cell: ({ row }) => (
        <BadgeOverflow
          items={row.getValue<string[]>("domains") || []}
          renderBadge={(_, label) => <Badge variant="outline">{label}</Badge>}
        />
      ),
    },
    {
      accessorKey: "isActive",
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("active")} />
      ),
      cell: ({ row }) => <ConfigActiveCell row={row} />,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("createdAt")} />
      ),
      cell: ({ row }) => (
        <span>{new Date(row.getValue("createdAt")).toLocaleString()}</span>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("updatedAt")} />
      ),
      cell: ({ row }) => (
        <span>{new Date(row.getValue("updatedAt")).toLocaleString()}</span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => <ConfigTableRowActions row={row} />,
    },
  ];

  return (
    <div>
      {showDetail ? (
        <ConfigDetail />
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
          columnVisibility={columnVisibility.value}
          onColumnVisibilityChange={columnVisibility.onChange}
        >
          {(table) => <ConfigTableToolbar table={table} />}
        </DataTable>
      )}
    </div>
  );
}
