import { DAILY_BACKUP_ALARM_NAME } from "@/features/backup/constants";

export function driveApiUrl(
  path: string,
  params?: Record<string, string | number | boolean>,
) {
  const base = new URL(`https://www.googleapis.com/drive/v3/${path}`);

  if (!params) return base;

  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    search.append(key, String(value));
  }

  return `${base}?${search.toString()}`;
}

export const createDailyBackupAlarm = async () => {
  const alarm = await browser.alarms.get(DAILY_BACKUP_ALARM_NAME);

  if (!alarm) {
    browser.alarms.create(
      DAILY_BACKUP_ALARM_NAME,
      {
        periodInMinutes: 60 * 24, // 24 hours
      },
      () => console.log(`Alarm "${DAILY_BACKUP_ALARM_NAME}" created`),
    );
  }
};
