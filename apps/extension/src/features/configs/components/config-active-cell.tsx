import type { Row } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToggleConfigActive } from "@/features/configs/hooks";
import type { ScrapeConfig } from "@/lib/dexie";
import { toast } from "sonner";

interface Props {
  row: Row<ScrapeConfig>;
}

export const ConfigActiveCell = ({ row }: Props) => {
  const [checked, setChecked] = useState(row.getValue<boolean>("isActive"));

  const { mutateAsync: toggleActive } = useToggleConfigActive();

  const handleCheckChange = async () => {
    const isActive = row.getValue("isActive");
    const toUpdate = isActive ? false : true;

    await toggleActive(
      {
        id: row.original.id,
        data: { isActive: toUpdate },
      },
      {
        onSuccess: () => {
          setChecked(toUpdate);
          toast.success("Config active state toggled successfully");
        },
        onError: (error) => {
          console.error("Error toggling config active state:", error);
          toast.error("Error toggling config active state", {
            description: error.message,
          });
        },
      },
    );
  };

  return <Checkbox checked={checked} onCheckedChange={handleCheckChange} />;
};
