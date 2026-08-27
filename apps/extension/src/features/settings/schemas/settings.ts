import z from "zod";

export const themeOptions = ["light", "dark", "system"] as const;
export const languageOptions = ["english", "vietnamese"] as const;
export const dateFormatOptions = [
  "DD/MM/YYYY",
  "MM/DD/YYYY",
  "YYYY-MM-DD",
] as const;
export const timeFormatOptions = ["24h", "12h"] as const;

export const settingsSchema = z.object({
  debugMode: z.boolean().default(false),
  theme: z.enum(themeOptions).default("system"),
  language: z.enum(languageOptions).default("english"),
  dateFormat: z.enum(dateFormatOptions).default("DD/MM/YYYY"),
  timeFormat: z.enum(timeFormatOptions).default("24h"),
  versionedBackup: z.boolean().default(true),
  versionedBackupMinIntervalHours: z.coerce
    .number()
    .min(1)
    .max(720)
    .default(24),
  maxBackupsToKeep: z.coerce.number().min(1).max(100).default(10),
});
