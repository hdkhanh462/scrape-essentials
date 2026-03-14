import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { BadgeOverflow } from "@/components/ui/badge-overflow";
import { Checkbox } from "@/components/ui/checkbox";
import { RecordCell } from "@/features/records/components/record-boolean-cell";
import { RecordTableRowActions } from "@/features/records/components/record-table-row-actions";
import { getFieldType } from "@/features/records/utils/helpers";
import type { ConfigField, ScrapedRecord } from "@/lib/dexie";

export function buildColumn(fields: ConfigField[]): ColumnDef<ScrapedRecord>[] {
  const temp: ColumnDef<ScrapedRecord>[] = [];
  fields.forEach((field) => {
    if (field.isParent || field.isPrimary) return;
    const colType = field.scrapeOptions?.isMultiple
      ? "string[]"
      : getFieldType(field.type, ["string", "number", "boolean"], "string");
    temp.push({
      id: field.name,
      accessorKey: `data.${field.name}`,
      meta: { type: colType },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={field.name} />
      ),
      cell: ({ row }) => (
        <div>
          {field.scrapeOptions?.isMultiple ? (
            <BadgeOverflow
              items={(row.original.data[field.name] as Array<string>) || []}
              renderBadge={(_, label) => (
                <Badge variant="outline">{label}</Badge>
              )}
            />
          ) : (
            <RecordCell
              row={row}
              columnId={field.name}
              value={getFieldType(
                field.type,
                [
                  row.original.data[field.name] as string,
                  Number(row.original.data[field.name]),
                  Boolean(row.original.data[field.name]),
                ],
                row.original.data[field.name] as string,
              )}
            />
          )}
        </div>
      ),
    });
  });

  return [
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
      accessorKey: "key",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Key" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="max-w-75 truncate font-medium">
            {row.getValue("key")}
          </span>
        </div>
      ),
    },
    ...temp,
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ row }) => (
        <span>{new Date(row.getValue("createdAt")).toLocaleString()}</span>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated At" />
      ),
      cell: ({ row }) => (
        <span>{new Date(row.getValue("updatedAt")).toLocaleString()}</span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => <RecordTableRowActions row={row} />,
    },
  ];
}
