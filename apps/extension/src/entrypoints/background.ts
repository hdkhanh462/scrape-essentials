import { updateIcon } from "@/features/records/utils/icon";
import { getCurrentPage } from "@/features/records/utils/scraper";
import { onMessage, sendMessage } from "@/lib/messaging";
import { logger } from "@/utils/logger";

export default defineBackground(() => {
  logger.debug("Hello from background!", { id: browser.runtime.id });

  onMessage("getCurrentPage", getCurrentPage);

  browser.tabs.onActivated.addListener(async ({ tabId }) => {
    const tab = await browser.tabs.get(tabId);

    logger.debug("Tab activated:", {
      tabId,
      url: tab.url,
    });

    try {
      await sendMessage("pageChanged", { url: tab.url });
    } catch (error) {
      logger.warn("Error sending pageChanged message:", error);
    }
    await updateIcon(tab);
  });

  browser.tabs.onUpdated.addListener(async (_, changeInfo, tab) => {
    logger.debug("Tab updated:", {
      tabId: tab.id,
      url: tab.url,
      changeInfo,
    });

    if (changeInfo.status === "complete") {
      try {
        await sendMessage("pageChanged", { url: tab.url });
      } catch (error) {
        logger.warn("Error sending pageChanged message:", error);
      }
      await updateIcon(tab);
    }
  });
});
