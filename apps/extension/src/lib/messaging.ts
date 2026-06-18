import { defineExtensionMessaging } from "@webext-core/messaging";
import type { CurrentPage } from "@/features/records/types/scrape";

interface ProtocolMap {
  getCurrentPage(): Promise<CurrentPage | null>;
  pageChanged(payload: { url: string | undefined }): Promise<void>;
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
