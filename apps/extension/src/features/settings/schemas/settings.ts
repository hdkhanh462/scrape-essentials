import z from "zod";

export const themeOptions = ["light", "dark", "system"] as const;
export const languageOptions = ["english", "vietnamese"] as const;

export const settingsSchema = z.object({
  debugMode: z.boolean().default(false),
  theme: z.enum(themeOptions).default("system"),
  language: z.enum(languageOptions).default("english"),
  autoBackup: z.boolean().default(false),
});
