import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import {
  addConfig,
  deleteConfig,
  duplicateConfig,
  editConfig,
  getConfigById,
  getConfigs,
  getConfigTags,
  importConfigs,
  toggleConfigActive,
} from "@/features/configs/services";
import type {
  AddConfigPayload,
  EditConfigPayload,
  GetConfigsPayload,
  ImportConfigsPayload,
  ToggleConfigActivePayload,
} from "@/features/configs/types";
import type { ScrapeConfig } from "@/lib/dexie";

export const configQueryKey = {
  all: ["configs"] as const,
  list: (payload: GetConfigsPayload) =>
    [...configQueryKey.all, "list", payload] as const,
  detail: (payload: { id: ScrapeConfig["id"]; isActive?: boolean }) =>
    [...configQueryKey.all, "detail", payload] as const,
  tags: () => [...configQueryKey.all, "tags"] as const,
};

export const useGetConfigs = (payload: GetConfigsPayload) => {
  return useQuery<ScrapeConfig[]>({
    queryKey: configQueryKey.list(payload),
    queryFn: () => getConfigs(payload),
  });
};

export const useGetConfigById = (
  payload: {
    id: ScrapeConfig["id"];
    isActive?: boolean;
  },
  options?: Pick<UseQueryOptions<ScrapeConfig | undefined>, "enabled">,
) => {
  return useQuery<ScrapeConfig | undefined>({
    enabled: options?.enabled ?? !!payload.id,
    queryKey: configQueryKey.detail(payload),
    queryFn: () => getConfigById(payload),
  });
};

export const useGetConfigTags = () => {
  return useQuery<ScrapeConfig["tags"]>({
    queryKey: configQueryKey.tags(),
    queryFn: () => getConfigTags(),
  });
};

export const useImportConfigs = (
  options?: UseMutationOptions<boolean, Error, ImportConfigsPayload>,
) => {
  return useMutation({
    ...options,
    mutationFn: (payload) => importConfigs(payload),
    meta: {
      invalidateQueries: configQueryKey.all,
    },
  });
};

export const useAddConfig = (
  options?: UseMutationOptions<ScrapeConfig["id"], Error, AddConfigPayload>,
) => {
  return useMutation({
    ...options,
    mutationFn: (payload) => addConfig(payload),
    meta: {
      invalidateQueries: configQueryKey.all,
    },
  });
};

export const useEditConfig = (
  options?: UseMutationOptions<boolean, Error, EditConfigPayload>,
) => {
  return useMutation({
    ...options,
    mutationFn: (payload) => editConfig(payload),
    meta: {
      invalidateQueries: configQueryKey.all,
    },
  });
};

export const useToggleConfigActive = (
  options?: UseMutationOptions<boolean, Error, ToggleConfigActivePayload>,
) => {
  return useMutation({
    ...options,
    mutationFn: (payload) => toggleConfigActive(payload),
    meta: {
      invalidateQueries: configQueryKey.all,
    },
  });
};

export const useDuplicateConfig = (
  options?: UseMutationOptions<ScrapeConfig["id"], Error, ScrapeConfig["id"]>,
) => {
  return useMutation({
    ...options,
    mutationFn: (payload) => duplicateConfig(payload),
    meta: {
      invalidateQueries: configQueryKey.all,
    },
  });
};

export const useDeleteConfig = (
  options?: UseMutationOptions<boolean, Error, ScrapeConfig["id"]>,
) => {
  return useMutation({
    ...options,
    mutationFn: (payload) => deleteConfig(payload),
    meta: {
      invalidateQueries: configQueryKey.all,
    },
  });
};
