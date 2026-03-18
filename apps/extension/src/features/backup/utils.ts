import { CHECK_BACKUP_ALARM_NAME } from "@/features/backup/constants";
import { useGoogleStore } from "@/features/backup/stores/google.store";
import { useSettingsStore } from "@/features/settings/stores/settings.store";
import { logger } from "@/utils/logger";

export const driveApiUrl = (
  path: string,
  params?: Record<string, string | number | boolean>,
) => {
  const base = new URL(`https://www.googleapis.com/drive/v3/${path}`);

  if (!params) return base;

  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    search.append(key, String(value));
  }

  return `${base}?${search.toString()}`;
};

export const shouldBackup = (minutes: number): boolean => {
  logger.log("Checking if backup is needed...");

  const { lastBackup } = useGoogleStore.getState();
  logger.log(
    "Last backup timestamp:",
    lastBackup ? new Date(lastBackup).toLocaleString() : "Never",
  );
  if (!lastBackup) return true;

  const interval = minutes * 60 * 1000;
  const diff = Date.now() - lastBackup;

  logger.log(
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
        logger.log(`Backup alarm created with ${minutes} minute(s) interval`);
    },
  );
};
