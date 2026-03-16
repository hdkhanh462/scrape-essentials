import { defineExtensionMessaging } from "@webext-core/messaging";
import type { CurrentPage } from "@/features/records/types/scrape";

interface ProtocolMap {
  getCurrentPage(): Promise<CurrentPage | undefined>;
  autoBackupChange: (enabled: boolean) => void;
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
