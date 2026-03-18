import type { ScrapedDataInput } from "@/features/records/types/form-input";
import type { MatchConfig } from "@/features/records/types/scrape";
import type { ScrapedRecord } from "@/lib/dexie";

type CopyDataOptions = {
  matchConfig: MatchConfig;
  scrapedData?: ScrapedDataInput;
  scrapedRecord?: ScrapedRecord | null;
  key?: ScrapedRecord["key"];
};

export function processCopyData({
  matchConfig,
  scrapedData,
  scrapedRecord,
  key,
}: CopyDataOptions) {
  let allDataStr = `[Web]: ${matchConfig.config.name}\n[Key]: ${key}\n`;

  matchConfig.fields.forEach((field) => {
    if (field.isParent) return;

    const value = scrapedData?.[field.name] || scrapedRecord?.data[field.name];
    const keyLabel = field.uiOptions?.label || field.name;

    allDataStr += `[${keyLabel}]: ${
      Array.isArray(value) ? value.join(", ") : value
    }\n`;
  });

  allDataStr = allDataStr.slice(0, -1); // Remove last newline
  return allDataStr;
}
