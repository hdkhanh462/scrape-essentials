import type z from "zod";
import type { SettingsSchema } from "@/features/settings/schemas/settings.schema";

export type SettingsInput = z.infer<typeof SettingsSchema>;
