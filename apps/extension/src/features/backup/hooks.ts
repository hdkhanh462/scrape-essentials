import {
  type UseMutationOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  connectGoogle,
  disconnectGoogle,
  downloadBackup,
  getBackupMetadata,
  listBackups,
  uploadBackup,
} from "@/features/backup/google-drive";
import { useGoogleStore } from "@/features/backup/stores/google.store";
import type { BackupMetadata, RestorePayload } from "@/features/backup/types";

export const backupQueryKey = {
  metadata: ["backup", "metadata"] as const,
  list: ["backup", "list"] as const,
};

export const useBackupMetadata = () => {
  const { userInfo } = useGoogleStore();

  return useQuery<BackupMetadata | null>({
    queryKey: backupQueryKey.metadata,
    queryFn: getBackupMetadata,
    enabled: !!userInfo,
  });
};

export const useBackupList = () => {
  const { userInfo } = useGoogleStore();

  return useQuery<BackupMetadata[]>({
    queryKey: backupQueryKey.list,
    queryFn: listBackups,
    enabled: !!userInfo,
  });
};

export const useConnectGoogle = (options?: UseMutationOptions<void>) => {
  return useMutation({
    ...options,
    mutationFn: connectGoogle,
  });
};

export const useDisconnectGoogle = (options?: UseMutationOptions<void>) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: disconnectGoogle,
    onSuccess: (...params) => {
      queryClient.invalidateQueries({ queryKey: backupQueryKey.metadata });
      options?.onSuccess?.(...params);
    },
  });
};

export const useBackupToDrive = (options?: UseMutationOptions<void>) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: async () => {
      await uploadBackup();
    },
    onSuccess: (...params) => {
      queryClient.invalidateQueries({ queryKey: backupQueryKey.metadata });
      queryClient.invalidateQueries({ queryKey: backupQueryKey.list });
      options?.onSuccess?.(...params);
    },
  });
};

export const useRestoreBackup = (
  options?: UseMutationOptions<RestorePayload, Error, string | undefined>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: downloadBackup,
    onSuccess: (...params) => {
      queryClient.invalidateQueries({ queryKey: backupQueryKey.metadata });
      options?.onSuccess?.(...params);
    },
  });
};
