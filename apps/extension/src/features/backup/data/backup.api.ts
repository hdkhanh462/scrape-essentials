import {
  backupToDrive,
  getUserInfo,
  restoreBackup,
} from "@/features/backup/services";
import type { GoogleUserInfo, ImportPayload } from "@/features/backup/types";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

export const backupApi = createApi({
  reducerPath: "backupApi",
  tagTypes: ["Backup"],
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    restoreBackup: builder.mutation<ImportPayload, void>({
      queryFn: async () => {
        const data = await restoreBackup();
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
    getUserInfo: builder.query<GoogleUserInfo | null, void>({
      queryFn: async () => {
        const data = await getUserInfo();
        return { data };
      },
    }),
  }),
});

export const {
  useRestoreBackupMutation,
  useBackupToDriveMutation,
  useGetUserInfoQuery,
} = backupApi;
export const backupReducer = backupApi.reducer;
