export const DAY_IN_MS = 24 * 60 * 60 * 1000; // Milliseconds

export const BUFFER_IN_MS = 60 * 1000; // Milliseconds

export const BACKUP_FILE_NAME_PREFIX = "backup_";

export const BACKUP_FOLDER_NAME = `${browser.runtime.getManifest().name} Backups`;

export const CHECK_BACKUP_ALARM_NAME = "checkBackup";

export const CHECK_BACKUP_ALARM_INTERVAL = 10; // Minutes
