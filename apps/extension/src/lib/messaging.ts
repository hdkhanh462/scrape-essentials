import { CurrentPage } from "@/features/records/types/scrape";
import { defineExtensionMessaging } from "@webext-core/messaging";

interface ProtocolMap {
  getCurrentPage(): Promise<CurrentPage | undefined>;
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
