import { DAILY_BACKUP_ALARM_NAME } from "@/features/backup/constants";
import { backupToDrive } from "@/features/backup/services";
import { createDailyBackupAlarm } from "@/features/backup/utils";
import { getCurrentPage } from "@/features/records/utils/scraper";
import { onMessage } from "@/lib/messaging";

export default defineBackground(() => {
  console.info("Hello from background!", { id: browser.runtime.id });

  createDailyBackupAlarm();

  browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === DAILY_BACKUP_ALARM_NAME) {
      console.log("Running daily backup");
      await backupToDrive({ authIfMissing: false });
    }
  });

  onMessage("getCurrentPage", async () => {
    const result = await getCurrentPage();
    return result;
  });
});
