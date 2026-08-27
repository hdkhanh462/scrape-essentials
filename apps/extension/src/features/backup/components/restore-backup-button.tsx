import { ChevronDownIcon, HistoryIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useBackupList } from "@/features/backup/hooks";
import { useGoogleStore } from "@/features/backup/stores/google.store";
import { useSettingsStore } from "@/features/settings/stores/settings.store";
import { formatDateTime } from "@/utils/date";
import { formatBytes } from "@/utils/format-bytes";

type RestoreBackupButtonProps = {
  disabled?: boolean;
  isPending?: boolean;
  onRestore: (fileId?: string) => void;
};

export function RestoreBackupButton({
  disabled,
  isPending,
  onRestore,
}: RestoreBackupButtonProps) {
  const [open, setOpen] = useState(false);

  const { t } = useTranslation();
  const { userInfo } = useGoogleStore();
  const { dateFormat, timeFormat } = useSettingsStore();

  const backupListQuery = useBackupList();
  const backups = backupListQuery.data ?? [];

  const isDisabled = disabled || !userInfo || isPending || backups.length === 0;

  if (backups.length <= 1) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 shadow-none"
        disabled={isDisabled}
        onClick={() => onRestore(backups[0]?.id)}
      >
        <Loader isLoading={!!isPending} />
        {!isPending && <HistoryIcon className="size-3.5" />}
        {t("button:restore")}
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 shadow-none"
            disabled={isDisabled}
          >
            <Loader isLoading={!!isPending} />
            {!isPending && <HistoryIcon className="size-3.5" />}
            {t("button:restore")}
            <ChevronDownIcon className="size-3.5 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-72 p-0" align="end">
        <Command>
          <CommandList>
            <CommandEmpty>{t("backup:noBackupYet")}</CommandEmpty>
            <CommandGroup>
              {backups.map((backup, index) => (
                <CommandItem
                  key={backup.id}
                  value={backup.id}
                  keywords={[backup.name]}
                  onSelect={() => {
                    onRestore(backup.id);
                    setOpen(false);
                  }}
                  className="flex-col items-start gap-0.5 [&>svg]:hidden"
                >
                  <span className="font-medium text-sm">
                    {formatDateTime(backup.createdTime, {
                      dateFormat,
                      timeFormat,
                    })}
                    {index === 0 && (
                      <span className="ml-2 text-muted-foreground text-xs">
                        {t("backup:latest")}
                      </span>
                    )}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {formatBytes(backup.size)}
                    {backup.extensionVersion &&
                      ` · v${backup.extensionVersion}`}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
