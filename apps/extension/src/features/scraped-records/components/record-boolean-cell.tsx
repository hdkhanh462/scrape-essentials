import type { Row } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { recordApi } from "@/features/scraped-records/data/record.api";
import type { ScrapedRecord } from "@/lib/dexie";

interface Props {
  row: Row<ScrapedRecord>;
  columnId: string;
  value: string | number | boolean;
}

export const RecordCell = ({ row, columnId, value }: Props) => {
  const [editRecord] = recordApi.useEditScrapedRecordMutation({});

  if (typeof value === "boolean")
    return (
      <Checkbox
        checked={value}
        onCheckedChange={async () => {
          const toUpdate = !value;
          const { error } = await editRecord({
            id: row.original.id,
            data: {
              data: {
                ...row.original.data,
                [columnId]: toUpdate,
              },
            },
          });
          if (error) {
            console.error("Error toggling config active state:", error);
            return !toUpdate;
          }
          return toUpdate;
        }}
      />
    );

  return (
    <div className="flex items-center gap-2">
      <span className="max-w-[300px] truncate font-medium">{value}</span>
    </div>
  );
};
