import type { Row } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { configApi } from "@/features/scrape-configs/data/config.api";
import type { ScrapeConfig } from "@/lib/dexie";

interface Props {
  row: Row<ScrapeConfig>;
}

export const ConfigActiveCell = ({ row }: Props) => {
  const [toggleActive] = configApi.useToggleConfigActiveMutation();
  return (
    <Checkbox
      checked={row.getValue("isActive")}
      onCheckedChange={async () => {
        const toUpdate = !row.getValue("isActive");
        const { error } = await toggleActive({
          id: row.original.id,
          data: { isActive: toUpdate },
        });
        if (error) {
          console.error("Error toggling config active state:", error);
          return !toUpdate;
        }
        return toUpdate;
      }}
    />
  );
};
