import type { ConfigField, ScrapeConfig } from "@/lib/dexie";

export type CurrentPage = {
  url: string;
  bodyHtml: string;
};

export type MatchConfig = {
  config: ScrapeConfig;
  fields: ConfigField[];
};
