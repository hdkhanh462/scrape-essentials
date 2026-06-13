import type { CurrentPage } from "@/features/records/types/scrape";
import { logger } from "@/utils/logger";

export async function scrapeByTabId(tabId: number): Promise<string> {
  try {
    const bodyHtml = await new Promise<string | undefined>(
      (resolve, reject) => {
        browser.scripting.executeScript(
          {
            target: { tabId },
            func: () => document.body.innerHTML,
          },
          (result) => {
            if (browser.runtime.lastError) {
              reject(new Error(browser.runtime.lastError.message));
              return;
            }
            if (!result || result.length === 0) {
              reject(new Error("No result from executeScript"));
              return;
            }
            if (result.at(0)?.result) resolve(result.at(0)?.result);
            else reject(new Error("Failed to retrieve body HTML"));
          },
        );
      },
    );

    if (!bodyHtml) throw new Error("Failed to scrape page content");

    return bodyHtml;
  } catch (error) {
    logger.error("Error when scraping current tab:", error);
    throw new Error("Failed to scrape page content");
  }
}

export async function getCurrentPage(): Promise<CurrentPage | undefined> {
  try {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab.id || !tab.url) return;

    logger.debug("Scraping current tab:", { id: tab.id, url: tab.url });

    const bodyHtml = await scrapeByTabId(tab.id);

    return { bodyHtml, url: tab.url };
  } catch (error) {
    logger.error("Error when scraping current tab:", error);
    return;
  }
}
