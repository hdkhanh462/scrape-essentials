import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { configQueryKey } from "@/features/configs/hooks";
import {
  addField,
  deleteField,
  editField,
  getFields,
} from "@/features/fields/services";
import type {
  AddFieldPayload,
  EditFieldPayload,
  GetFieldsPayload,
} from "@/features/fields/types";
import type { ConfigField } from "@/lib/dexie";

export const fieldQueryKey = {
  all: ["fields"] as const,
  list: (payload: GetFieldsPayload) =>
    [...configQueryKey.all, ...fieldQueryKey.all, payload] as const,
};

export const useGetFields = (
  payload: GetFieldsPayload,
  options?: Pick<UseQueryOptions<ConfigField[]>, "enabled">,
) => {
  return useQuery<ConfigField[]>({
    enabled: options?.enabled ?? !!payload.configId,
    queryKey: fieldQueryKey.list(payload),
    queryFn: () => getFields(payload),
  });
};

export const useAddField = (
  options?: UseMutationOptions<ConfigField["id"], Error, AddFieldPayload>,
) => {
  return useMutation({
    ...options,
    mutationFn: (payload) => addField(payload),
    meta: {
      invalidateQueries: configQueryKey.all,
    },
  });
};

export const useEditField = (
  options?: UseMutationOptions<boolean, Error, EditFieldPayload>,
) => {
  return useMutation({
    ...options,
    mutationFn: (payload) => editField(payload),
    meta: {
      invalidateQueries: configQueryKey.all,
    },
  });
};

export const useDeleteField = (
  options?: UseMutationOptions<boolean, Error, ConfigField["id"]>,
) => {
  return useMutation({
    ...options,
    mutationFn: (payload) => deleteField(payload),
    meta: {
      invalidateQueries: configQueryKey.all,
    },
  });
};
