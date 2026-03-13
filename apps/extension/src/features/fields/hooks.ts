import {
  type UseMutationOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

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

const fieldQueryKey = {
  all: ["fields"] as const,
  byId: (id: string) => [...fieldQueryKey.all, id] as const,
};

export const useGetFields = (payload: GetFieldsPayload) => {
  return useQuery<ConfigField[]>({
    enabled: !!payload.configId,
    queryKey: fieldQueryKey.all,
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
      invalidateQueries: fieldQueryKey.all,
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
      invalidateQueries: fieldQueryKey.all,
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
      invalidateQueries: fieldQueryKey.all,
    },
  });
};
