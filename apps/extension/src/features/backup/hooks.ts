import { backupToDrive, restoreBackup } from "@/features/backup/services";
import { useGoogleStore } from "@/features/backup/stores/google.store";
import { ImportPayload } from "@/features/backup/types";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

export const useBackupToDrive = (options?: UseMutationOptions<void>) => {
  const { setLastBackup } = useGoogleStore();

  return useMutation({
    ...options,
    mutationFn: () => backupToDrive(),
    onSuccess: (...params) => {
      setLastBackup(Date.now());
      options?.onSuccess?.(...params);
    },
  });
};

export const useRestoreBackup = (
  options?: UseMutationOptions<ImportPayload>,
) => {
  const { setLastRestore } = useGoogleStore();

  return useMutation({
    ...options,
    mutationFn: restoreBackup,
    onSuccess: (...params) => {
      setLastRestore(Date.now());
      options?.onSuccess?.(...params);
    },
  });
};
