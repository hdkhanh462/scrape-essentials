import type z from "zod";

import type { ConfigSchema } from "@/features/configs/schemas";

export type ConfigInput = z.infer<typeof ConfigSchema>;
