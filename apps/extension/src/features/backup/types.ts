import type { ConfigField, ScrapeConfig, ScrapedRecord } from "@/lib/dexie";

export type OAuthTokenResponse = {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
};

export type ImportPayload = {
  configs: ScrapeConfig[];
  fields: ConfigField[];
  records: ScrapedRecord[];
};

export type GoogleUserInfo = {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
};
