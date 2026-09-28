import { ChevronDownIcon, HistoryIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
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
import { useBackupList, useDeleteBackup } from "@/features/backup/hooks";
import { useGoogleStore } from "@/features/backup/stores/google.store";
import { useSettingsStore } from "@/features/settings/stores/settings.store";
import { useDialog } from "@/hooks/use-dialog";
import { formatDateTime } from "@/utils/date";
import { formatBytes } from "@/utils/format-bytes";
import { toastError } from "@/utils/toast";

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
  const [deletingId, setDeletingId] = useState<string>();

  const { t } = useTranslation();
  const { userInfo } = useGoogleStore();
  const { dateFormat, timeFormat } = useSettingsStore();

  const backupListQuery = useBackupList();
  const backups = backupListQuery.data ?? [];

  const deleteConfirmDialog = useDialog();
  const deleteMutation = useDeleteBackup({
    onSuccess: () => {
      deleteConfirmDialog.close();
      toast.success(t("message:backupDeletedSuccessfully"));
    },
    onError: (error) => toastError(error, t("message:failedToDeleteBackup")),
  });

  const handleDeleteClick = (fileId: string) => {
    setDeletingId(fileId);
    setOpen(false);
    deleteConfirmDialog.open();
  };

  const handleDelete = () => {
    if (deletingId) deleteMutation.mutate(deletingId);
  };

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
    <>
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
                    className="group/backup-item [&>svg]:hidden"
                  >
                    <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                      <span className="font-medium text-sm">
                        {formatDateTime(backup.modifiedTime, {
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
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="opacity-0 group-hover/backup-item:opacity-100 group-data-[selected=true]/backup-item:opacity-100"
                      aria-label={t("button:delete")}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(backup.id);
                      }}
                    >
                      <Trash2Icon />
                    </Button>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <ConfirmDialog
        control={deleteConfirmDialog}
        title={t("dialog:areYouSure")}
        description={t("dialog:deleteBackupConfirmation")}
        onConfirm={handleDelete}
        cancelButton={{ override: { disabled: deleteMutation.isPending } }}
        confirmButton={{
          label: t("button:delete"),
          isLoading: deleteMutation.isPending,
          override: { disabled: deleteMutation.isPending },
        }}
      />
    </>
  );
}
