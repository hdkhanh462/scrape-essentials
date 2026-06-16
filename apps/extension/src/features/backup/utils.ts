import { CHECK_BACKUP_ALARM_NAME } from "@/features/backup/constants";
import { useGoogleStore } from "@/features/backup/stores/google.store";
import { useSettingsStore } from "@/features/settings/stores/settings.store";
import { logger } from "@/utils/logger";

export const urlBuilder = (base: string) => {
  return (
    path: string,
    params?: Record<string, string | number | boolean>,
  ): string => {
    const url = new URL(`${base}${path}`);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, String(value));
      }
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

export const oAuthUrl = urlBuilder("https://accounts.google.com/o/oauth2");

export const apiUrl = urlBuilder(import.meta.env.VITE_API_URL);

export const shouldBackup = (minutes: number): boolean => {
  logger.debug("Checking if backup is needed...");

  const { lastBackup } = useGoogleStore.getState();
  logger.debug(
    "Last backup timestamp:",
    lastBackup ? new Date(lastBackup).toLocaleString() : "Never",
  );
  if (!lastBackup) return true;

  const interval = minutes * 60 * 1000;
  const diff = Date.now() - lastBackup;

  logger.debug(
    `Next check backup in ${Math.max(0, Math.round((interval - diff) / 60000))} minutes`,
  );

  return Date.now() - lastBackup >= interval;
};

export const createCheckBackupAlarm = (minutes: number) => {
  const { autoBackup } = useSettingsStore.getState();
  if (!autoBackup) return;

  browser.alarms.create(
    CHECK_BACKUP_ALARM_NAME,
    { periodInMinutes: minutes },
    () => {
      if (browser.runtime.lastError)
        logger.error(
          "Failed to create backup alarm:",
          browser.runtime.lastError.message,
        );
      else
        logger.debug(`Backup alarm created with ${minutes} minute(s) interval`);
    },
  );
};
