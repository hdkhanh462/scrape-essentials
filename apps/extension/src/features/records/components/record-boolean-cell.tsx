import type { Row } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import type { ScrapedRecord } from "@/lib/dexie";
import { useEditRecord } from "../hooks";
import { toast } from "sonner";
import { toastError } from "@/utils/toast";

interface Props {
  row: Row<ScrapedRecord>;
  columnId: string;
  value: string | number | boolean;
}

export const RecordCell = ({ row, columnId, value }: Props) => {
  const { mutate: editRecord } = useEditRecord();

  const handleCheckedChange = async () => {
    const toUpdate = !value;
    editRecord(
      {
        id: row.original.id,
        data: {
          data: {
            ...row.original.data,
            [columnId]: toUpdate,
          },
        },
      },
      {
        onError: (error) => toastError(error, "Update record failed"),
      },
    );
  };

  if (typeof value === "boolean")
    return <Checkbox checked={value} onCheckedChange={handleCheckedChange} />;

  return (
    <div className="flex items-center gap-2">
      <span className="max-w-75 truncate font-medium">{value}</span>
    </div>
  );
};
