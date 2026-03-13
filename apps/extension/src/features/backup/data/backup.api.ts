import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  backupToDrive,
  downloadBackup,
  getLatestBackup,
} from "@/features/backup/services";
import type { ImportPayload } from "@/features/backup/types";
import { getAccessToken, getAuthToken } from "@/features/backup/utils/identity";
import { ungzipJSON } from "@/utils/gzip";

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
    backupToDrive: builder.mutation<string, void>({
      invalidatesTags: ["Backup"],
      queryFn: async () => {
        await backupToDrive();

        return { data: "success" };
      },
    }),
  }),
});

export const { useRestoreBackupMutation, useBackupToDriveMutation } = backupApi;
export const backupReducer = backupApi.reducer;
