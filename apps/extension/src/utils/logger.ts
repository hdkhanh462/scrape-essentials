/** biome-ignore-all lint/suspicious/noExplicitAny: <> */
import { useSettingsStore } from "@/features/settings/stores/settings.store";

const log = (...args: any[]) => {
  const { debugMode } = useSettingsStore.getState();
  if (debugMode) console.log(...args);
};

const error = (...args: any[]) => {
  const { debugMode } = useSettingsStore.getState();
  if (debugMode) console.error(...args);
};

export const logger = { log, error };
