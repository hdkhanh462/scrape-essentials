import { DAY_IN_MS } from "../constants";

export async function shouldBackup() {
  const lastBackup = await storage.getItem<number | null>("local:lastBackup");

  if (!lastBackup) return true;

  return Date.now() - lastBackup > DAY_IN_MS;
}
