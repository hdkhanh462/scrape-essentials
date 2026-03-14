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

export const scrapedRecordQueryKey = {
  all: ["records"] as const,
  list: (payload: GetScrapedRecordsPayload) =>
    [...scrapedRecordQueryKey.all, payload] as const,
  detail: (payload: GetScrapedRecordPayload) =>
    [...scrapedRecordQueryKey.all, "detail", payload] as const,
};

export const useGetRecords = (payload: GetScrapedRecordsPayload) => {
  return useQuery<ScrapedRecord[]>({
    queryKey: scrapedRecordQueryKey.list(payload),
    queryFn: () => getRecords(payload),
    enabled: !!payload.configId,
  });
};

export const useGetRecordById = (payload: GetScrapedRecordPayload) => {
  return useQuery<ScrapedRecord | undefined>({
    queryKey: scrapedRecordQueryKey.detail(payload),
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
      invalidateQueries: scrapedRecordQueryKey.all,
    },
  });
};

export const useAddRecord = (
  options?: UseMutationOptions<
    ScrapedRecord["id"],
    Error,
    AddScrapedRecordPayload
  >,
) => {
  return useMutation({
    ...options,
    mutationFn: (payload) => addRecord(payload),
    meta: {
      invalidateQueries: scrapedRecordQueryKey.all,
    },
  });
};

export const useEditRecord = (
  options?: UseMutationOptions<boolean, Error, EditScrapedRecordPayload>,
) => {
  return useMutation({
    ...options,
    mutationFn: (payload) => editRecord(payload),
    meta: {
      invalidateQueries: scrapedRecordQueryKey.all,
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
      invalidateQueries: scrapedRecordQueryKey.all,
    },
  });
};

export const useGetCurrentPage = () => {
  return useQuery<CurrentPage | undefined>({
    queryKey: ["currentPage"],
    queryFn: async () => sendMessage("getCurrentPage"),
  });
};
