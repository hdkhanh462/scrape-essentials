import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  downloadBackup,
  getLatestBackup,
  getOrCreateBackupFolder,
  uploadBackup,
} from "@/features/backup/services";
import type { ImportPayload } from "@/features/backup/types";
import { getAccessToken, getAuthToken } from "@/features/backup/utils/identity";
import { gzipJSON, ungzipJSON } from "@/utils/gzip";

export const backupApi = createApi({
  reducerPath: "backupApi",
  tagTypes: ["Backup"],
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    restoreBackup: builder.mutation<ImportPayload, void>({
      queryFn: async () => {
        let token: string | null = null;

        if (import.meta.env.BROWSER === "brave") token = await getAccessToken();
        else token = await getAuthToken();

        const latest = await getLatestBackup(token);

        const buffer = await downloadBackup(token, latest.id);

        const data = ungzipJSON<ImportPayload>(buffer);

        return { data };
      },
    }),
    backupToDrive: builder.mutation<
      string,
      { data: ImportPayload; version: string }
    >({
      invalidatesTags: ["Backup"],
      queryFn: async (payload) => {
        let token: string | null = null;

        if (import.meta.env.BROWSER === "brave") token = await getAccessToken();
        else token = await getAuthToken();

        const folderId = await getOrCreateBackupFolder(token);

        const blob = gzipJSON(payload.data);

        await uploadBackup(token, folderId, blob, payload.version);

        return { data: "success" };
      },
    }),
  }),
});

export const { useRestoreBackupMutation, useBackupToDriveMutation } = backupApi;
export const backupReducer = backupApi.reducer;
