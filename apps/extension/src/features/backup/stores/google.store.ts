import {
  GoogleUserInfo,
  OAuthRefreshResponse,
  OAuthTokenResponse,
} from "@/features/backup/types";
import { wxtStorage } from "@/features/shared/stores/wxt-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type GoogleState = {
  refreshToken: string | null;
  accessToken: string | null;
  accessTokenExpiry: number | null;
  userInfo: GoogleUserInfo | null;
  lastBackup: number | null;
  lastRestore: number | null;
  backupFolderId: string | null;
};

type GoogleSlice = GoogleState & {
  setRefreshToken: (refreshToken: string | null) => void;
  setAccessToken: (accessToken: string | null) => void;
  setAccessTokenExpiry: (accessTokenExpiry: number | null) => void;
  setUserInfo: (userInfo: GoogleUserInfo | null) => void;
  setLastBackup: (lastBackup: number | null) => void;
  setLastRestore: (lastRestore: number | null) => void;
  setBackupFolderId: (backupFolderId: string | null) => void;
  login: (token: OAuthTokenResponse) => void;
  logout: () => void;
  refresh: (token: OAuthRefreshResponse) => void;
};

export const DEFAULT_GOOGLE: GoogleState = {
  refreshToken: null,
  accessToken: null,
  accessTokenExpiry: null,
  userInfo: null,
  lastBackup: null,
  lastRestore: null,
  backupFolderId: null,
};

export const useGoogleStore = create<GoogleSlice>()(
  persist(
    (set) => ({
      ...DEFAULT_GOOGLE,
      setRefreshToken: (refreshToken) => set(() => ({ refreshToken })),
      setAccessToken: (accessToken) => set(() => ({ accessToken })),
      setAccessTokenExpiry: (accessTokenExpiry) =>
        set(() => ({ accessTokenExpiry })),
      setUserInfo: (userInfo) => set(() => ({ userInfo })),
      setLastBackup: (lastBackup) => set(() => ({ lastBackup })),
      setLastRestore: (lastRestore) => set(() => ({ lastRestore })),
      setBackupFolderId: (backupFolderId) => set(() => ({ backupFolderId })),
      login: (token) =>
        set(() => ({
          accessToken: token.accessToken,
          accessTokenExpiry: token.expiresAt,
          refreshToken: token.refreshToken,
        })),
      logout: () => set(() => DEFAULT_GOOGLE),
      refresh: (token) =>
        set(() => ({
          accessToken: token.accessToken,
          accessTokenExpiry: token.expiresAt,
        })),
    }),
    {
      name: "google-storage",
      storage: createJSONStorage(() => wxtStorage),
    },
  ),
);
