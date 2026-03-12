import type { ConfigField, ScrapeConfig, ScrapedRecord } from "@/lib/dexie";

export type OAuthTokenResponse = {
  accessToken: string;
  expiresAt: number;
  refreshToken: string;
};

export type ImportPayload = {
  configs: ScrapeConfig[];
  fields: ConfigField[];
  records: ScrapedRecord[];
};
