import { getConfigs } from "@/features/configs/services";
import { getCurrentPage } from "@/features/records/utils/scraper";
import { onMessage } from "@/lib/messaging";
import { logger } from "@/utils/logger";

export default defineBackground(() => {
  logger.debug("Hello from background!", { id: browser.runtime.id });

  onMessage("getCurrentPage", getCurrentPage);

  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
      // const bodyHtml = await scrapeByTabId(tabId);
      const configs = await getConfigs({ isActive: true });
      const matchConfig = configs.find((config) =>
        config.domains.some(
          (domain) => tab.url && new RegExp(domain).test(tab.url),
        ),
      );

      logger.debug("Tab updated:", { tabId, url: tab.url, changeInfo });

      if (!matchConfig) {
        await browser.action.disable(tabId);
        await browser.action.setBadgeText({ tabId, text: "OFF" });
        await browser.action.setIcon({
          tabId,
          path: {
            16: browser.runtime.getURL("/icons/16-grayscale.png"),
            32: browser.runtime.getURL("/icons/32-grayscale.png"),
          },
        });
        return;
      }

      logger.debug("Matched config for updated tab:", {
        tabId,
        url: tab.url,
        config: matchConfig,
      });

      await browser.action.enable(tabId);
      await browser.action.setBadgeText({ tabId, text: "" });
      await browser.action.setIcon({
        tabId,
        path: {
          16: browser.runtime.getURL("/icons/16.png"),
          32: browser.runtime.getURL("/icons/32.png"),
        },
      });
    }
  });
});
