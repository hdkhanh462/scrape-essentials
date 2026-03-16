import z from "zod";

export const themseOptions = ["light", "dark", "system"] as const;
export const languageOptions = ["english", "vietnamese"] as const;

export const settingsSchema = z.object({
  debugMode: z.boolean().default(false),
  theme: z.enum(themseOptions).default("system"),
  language: z.enum(languageOptions).default("english"),
  autoBackup: z.boolean().default(false),
});
