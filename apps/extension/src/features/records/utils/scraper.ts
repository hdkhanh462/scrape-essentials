import type { CurrentPage } from "@/features/records/types/scrape";

export async function getCurrentPage(): Promise<CurrentPage | undefined> {
  try {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab.url) return;

    const bodyHtml = await new Promise<string | undefined>(
      (resolve, reject) => {
        if (!tab.id) {
          reject(new Error("Tab ID is missing."));
          return;
        }

        browser.scripting.executeScript(
          {
            target: { tabId: tab.id },
            func: () => document.body.innerHTML,
          },
          (result) => {
            if (browser.runtime.lastError) {
              reject(new Error(browser.runtime.lastError.message));
              return;
            }
            if (!result || result.length === 0) {
              reject(new Error("No result from executeScript."));
              return;
            }
            if (result.at(0)?.result) resolve(result.at(0)?.result);
            else reject(new Error("Failed to retrieve body HTML"));
          },
        );
      },
    );

    if (!bodyHtml) return;

    // const sanitizedHtml = bodyHtml.replace(
    //   /<[^>]*\s+src\s*=\s*["'][^"']*["'][^>]*>/gi,
    //   "",
    // );

    return { bodyHtml, url: tab.url };
  } catch (error) {
    console.error("Error when scrape current tab:", error);
  }
}
