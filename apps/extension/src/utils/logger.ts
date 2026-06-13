/** biome-ignore-all lint/suspicious/noExplicitAny: <> */
import { useSettingsStore } from "@/features/settings/stores/settings.store";

const debug = (...args: any[]) => {
  const { debugMode } = useSettingsStore.getState();
  if (debugMode) console.log("[DEBUG]", ...args);
};

const error = (...args: any[]) => {
  const { debugMode } = useSettingsStore.getState();
  if (debugMode) console.error("[ERROR]", ...args);
};

export const logger = { debug, error };
