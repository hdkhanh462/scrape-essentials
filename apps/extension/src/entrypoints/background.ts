import { CHECK_BACKUP_ALARM_NAME } from "@/features/backup/constants";
import { autoBackup } from "@/features/backup/services";
import { createCheckBackupAlarm } from "@/features/backup/utils";
import { getCurrentPage } from "@/features/records/utils/scraper";
import { onMessage } from "@/lib/messaging";
import { logger } from "@/utils/logger";

export default defineBackground(() => {
  logger.log("Hello from background!", { id: browser.runtime.id });

  onMessage("getCurrentPage", getCurrentPage);

  onMessage("autoBackupChange", async ({ data: newValue }) => {
    if (!newValue) {
      logger.log("Clearing backup alarm...");
      browser.alarms.clear(CHECK_BACKUP_ALARM_NAME, () => {
        logger.log("Check backup alarm cleared successfully.");
      });
      return;
    }

    createCheckBackupAlarm(60);
  });

  // Ensure the backup alarm is created on startup if autoBackup is enabled
  createCheckBackupAlarm(60);

  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === CHECK_BACKUP_ALARM_NAME) {
      autoBackup();
    }
  });
});
