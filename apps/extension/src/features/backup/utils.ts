import type { BackupMetadata } from "@/features/backup/types";
import { logger } from "@/utils/logger";

export const urlBuilder = (base: string) => {
  return (
    path: string,
    params?: Record<string, string | number | boolean>,
  ): string => {
    const url = new URL(`${base}${path}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
    }

    logger.debug("Constructed URL:", {
      base,
      path,
      params,
      url: url.toString(),
    });

    return url.toString();
  };
};

export const driveApiUrl = urlBuilder("https://www.googleapis.com/drive/v3");
export const driveUploadApiUrl = urlBuilder(
  "https://www.googleapis.com/upload/drive/v3",
);

export const oAuthUrl = urlBuilder("https://accounts.google.com/o/oauth2");

export const apiUrl = urlBuilder(import.meta.env.VITE_API_URL);

export const shouldCreateNewBackup = (
  latest: BackupMetadata,
  {
    minIntervalHours,
    currentVersion,
  }: { minIntervalHours: number; currentVersion: string },
): boolean => {
  const lastTime = new Date(latest.createdTime).getTime();
  const now = Date.now();

  const differentDay =
    new Date(lastTime).toDateString() !== new Date(now).toDateString();
  const intervalExceeded = now - lastTime >= minIntervalHours * 60 * 60 * 1000;
  const versionChanged =
    !!latest.extensionVersion && latest.extensionVersion !== currentVersion;

  logger.debug("Checking whether to create a new versioned backup:", {
    differentDay,
    intervalExceeded,
    versionChanged,
  });

  return differentDay || intervalExceeded || versionChanged;
};
