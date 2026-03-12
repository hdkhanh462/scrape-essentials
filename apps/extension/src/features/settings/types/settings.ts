import type z from "zod";
import type { settingsSchema } from "@/features/settings/schemas/settings";

export type SettingsInput = z.infer<typeof settingsSchema>;
