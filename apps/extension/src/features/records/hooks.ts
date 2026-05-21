import {
  type UseMutationOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import {
  addRecord,
  deleteRecord,
  editRecord,
  getRecordById,
  getRecords,
  importRecords,
} from "@/features/records/services";
import type {
  AddScrapedRecordPayload,
  EditScrapedRecordPayload,
  GetScrapedRecordPayload,
  GetScrapedRecordsPayload,
  ImportRecordsPayload,
} from "@/features/records/types";
import type { CurrentPage } from "@/features/records/types/scrape";
import type { ScrapedRecord } from "@/lib/dexie";
import { sendMessage } from "@/lib/messaging";

export const recordQueryKey = {
  all: ["records"] as const,
  list: (payload: GetScrapedRecordsPayload) =>
    [...recordQueryKey.all, "list", payload] as const,
  detail: (payload: GetScrapedRecordPayload) =>
    [...recordQueryKey.all, "detail", payload] as const,
};

export const useGetRecords = (payload: GetScrapedRecordsPayload) => {
  return useQuery<ScrapedRecord[]>({
    queryKey: recordQueryKey.list(payload),
    queryFn: () => getRecords(payload),
    enabled: !!payload.configId,
  });
};

export const useGetRecordById = (payload: GetScrapedRecordPayload) => {
  return useQuery<ScrapedRecord | null>({
    queryKey: recordQueryKey.detail(payload),
    queryFn: () => getRecordById(payload),
  });
};

export const useImportRecords = (
  options?: UseMutationOptions<boolean, Error, ImportRecordsPayload>,
) => {
  return useMutation({
    ...options,
    mutationFn: (payload) => importRecords(payload),
    meta: {
      invalidateQueries: recordQueryKey.all,
    },
  });
};

export const useAddRecord = (
  url: string,
  options?: UseMutationOptions<
    ScrapedRecord["id"],
    Error,
    AddScrapedRecordPayload
  >,
) => {
  return useMutation({
    ...options,
    mutationFn: (payload) => addRecord(url, payload),
    meta: {
      invalidateQueries: recordQueryKey.all,
    },
  });
};

export const useEditRecord = (
  url: string,
  options?: UseMutationOptions<boolean, Error, EditScrapedRecordPayload>,
) => {
  return useMutation({
    ...options,
    mutationFn: (payload) => editRecord(url, payload),
    meta: {
      invalidateQueries: recordQueryKey.all,
    },
  });
};

export const useDeleteRecord = (
  options?: UseMutationOptions<boolean, Error, ScrapedRecord["id"]>,
) => {
  return useMutation({
    ...options,
    mutationFn: (payload) => deleteRecord(payload),
    meta: {
      invalidateQueries: recordQueryKey.all,
    },
  });
};

export const useGetCurrentPage = () => {
  return useQuery<CurrentPage | undefined>({
    queryKey: ["currentPage"],
    queryFn: async () => sendMessage("getCurrentPage"),
  });
};
