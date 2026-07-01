import type { Row } from "@tanstack/react-table";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { useToggleConfigActive } from "@/features/configs/hooks";
import type { ScrapeConfig } from "@/lib/dexie";
import { toastError } from "@/utils/toast";

interface Props {
  row: Row<ScrapeConfig>;
}

export const ConfigActiveCell = ({ row }: Props) => {
  const { t } = useTranslation();

  const [checked, setChecked] = useState(row.getValue<boolean>("isActive"));

  const { mutateAsync: toggleActive } = useToggleConfigActive();

  const handleCheckChange = async () => {
    const isActive = row.getValue("isActive");
    const toUpdate = !isActive;

    await toggleActive(
      {
        id: row.original.id,
        data: { isActive: toUpdate },
      },
      {
        onSuccess: () => {
          setChecked(toUpdate);
          toast.success(t("message.configActiveStateToggled"));
        },
        onError: (error) =>
          toastError(error, t("message.failedToToggleConfigActiveState")),
      },
    );
  };

  return <Checkbox checked={checked} onCheckedChange={handleCheckChange} />;
};
