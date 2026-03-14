import { BUFFER_IN_MS } from "@/features/backup/constants";
import {
  downloadBackup,
  getLatestBackup,
  getOrCreateBackupFolder,
  uploadBackup,
} from "@/features/backup/services";
import { useGoogleStore } from "@/features/backup/stores/google.store";
import { GoogleUserInfo, ImportPayload } from "@/features/backup/types";
import {
  launchWebAuthFlow,
  refreshAccessToken,
} from "@/features/backup/identity";
import { dexie } from "@/lib/dexie";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

export const useGetAccessToken = () => {
  const {
    accessToken,
    accessTokenExpiry,
    refreshToken,
    userInfo,
    setUserInfo,
    login,
    refresh,
  } = useGoogleStore();

  const googleAuth = async (
    { authIfMissing } = { authIfMissing: true },
  ): Promise<string | null> => {
    if (!accessToken || !accessTokenExpiry || !refreshToken) {
      if (!authIfMissing) return null;

      const res = await launchWebAuthFlow();
      login(res);

      if (!userInfo && res.accessToken) {
        await getUserInfo(res.accessToken);
      }

      return res.accessToken;
    }

    if (Date.now() < accessTokenExpiry - BUFFER_IN_MS) return accessToken;

    const res = await refreshAccessToken(refreshToken);
    refresh(res);

    if (!userInfo && res.accessToken) {
      await getUserInfo(res.accessToken);
    }

    return res.accessToken;
  };

  const getUserInfo = async (
    accessToken: string,
  ): Promise<GoogleUserInfo | null> => {
    if (userInfo) return userInfo;

    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return null;

    const newUserInfo = await res.json();
    setUserInfo(newUserInfo);
    return newUserInfo;
  };

  return { googleAuth, getUserInfo };
};

export const googleQueryKeys = {
  all: ["google"],
};

export const useBackupToDrive = (options?: UseMutationOptions<void>) => {
  const { backupFolderId, setLastBackup, setBackupFolderId } = useGoogleStore();
  const { googleAuth } = useGetAccessToken();

  return useMutation({
    ...options,
    mutationKey: googleQueryKeys.all,
    mutationFn: async () => {
      const accessToken = await googleAuth();
      if (!accessToken) throw new Error("No access token found");

      let folderId = backupFolderId;
      if (!folderId) {
        folderId = await getOrCreateBackupFolder(accessToken);
        setBackupFolderId(folderId);
      }

      const [configs, fields, records] = await Promise.all([
        dexie.scrapeConfigs.toArray(),
        dexie.configFields.toArray(),
        dexie.scrapedRecords.toArray(),
      ]);

      const blob = gzipJSON({ configs, fields, records });

      await uploadBackup(
        accessToken,
        folderId,
        blob,
        browser.runtime.getVersion(),
      );
    },
    onSuccess: (...params) => {
      setLastBackup(Date.now());
      options?.onSuccess?.(...params);
    },
  });
};

export const useRestoreBackup = (
  options?: UseMutationOptions<ImportPayload>,
) => {
  const { backupFolderId, setLastRestore, setBackupFolderId } =
    useGoogleStore();
  const { googleAuth } = useGetAccessToken();

  return useMutation({
    ...options,
    mutationKey: googleQueryKeys.all,
    mutationFn: async () => {
      const accessToken = await googleAuth();
      if (!accessToken) throw new Error("No access token found");

      let folderId = backupFolderId;
      if (!folderId) {
        folderId = await getOrCreateBackupFolder(accessToken);
        setBackupFolderId(folderId);
      }

      const latest = await getLatestBackup(accessToken, folderId);
      const buffer = await downloadBackup(accessToken, latest.id);

      return ungzipJSON<ImportPayload>(buffer);
    },
    onSuccess: (...params) => {
      setLastRestore(Date.now());
      options?.onSuccess?.(...params);
    },
  });
};
