import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  downloadBackup,
  getLatestBackup,
  getOrCreateBackupFolder,
  uploadBackup,
} from "@/features/backup/services";
import { getAuthToken } from "@/features/backup/utils/identity";
import { gzipJSON, ungzipJSON } from "@/utils/gzip";

export const backupApi = createApi({
  reducerPath: "backupApi",
  tagTypes: ["Backup"],
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    restoreBackup: builder.mutation<string, void>({
      queryFn: async () => {
        try {
          const token = await getAuthToken();

          const latest = await getLatestBackup(token);

          const buffer = await downloadBackup(token, latest.id);

          const data = ungzipJSON(buffer);

          return { data };
        } catch (error) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: String(error),
            },
          };
        }
      },
    }),
    backupToDrive: builder.mutation<string, { data: object; version: string }>({
      invalidatesTags: ["Backup"],
      queryFn: async (payload) => {
        try {
          const token = await getAuthToken();

          const folderId = await getOrCreateBackupFolder(token);

          const blob = gzipJSON(payload.data);

          await uploadBackup(token, folderId, blob, payload.version);

          return { data: "success" };
        } catch (error) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: String(error),
            },
          };
        }
      },
    }),
  }),
});

export const { useRestoreBackupMutation, useBackupToDriveMutation } = backupApi;
