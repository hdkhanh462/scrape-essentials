import { getConfigs } from "@/features/configs/services";

export const updateIcon = async (tab: Browser.tabs.Tab) => {
  const configs = await getConfigs({ isActive: true });
  const matchConfig = configs.find((config) =>
    config.domains.some(
      (domain) => tab.url && new RegExp(domain).test(tab.url),
    ),
  );

  if (!matchConfig) {
    await browser.action.disable(tab.id);
    await browser.action.setBadgeText({ tabId: tab.id, text: "OFF" });
    await browser.action.setIcon({
      tabId: tab.id,
      path: {
        16: browser.runtime.getURL("/icons/16-grayscale.png"),
        32: browser.runtime.getURL("/icons/32-grayscale.png"),
      },
    });

    logger.debug("No matching config for updated tab:", {
      tabId: tab.id,
      url: tab.url,
    });
    return;
  }

  await browser.action.enable(tab.id);
  await browser.action.setBadgeText({ tabId: tab.id, text: "" });
  await browser.action.setIcon({
    tabId: tab.id,
    path: {
      16: browser.runtime.getURL("/icons/16.png"),
      32: browser.runtime.getURL("/icons/32.png"),
    },
  });

  logger.debug("Matched config for updated tab:", {
    tabId: tab.id,
    url: tab.url,
    config: matchConfig,
  });
};
