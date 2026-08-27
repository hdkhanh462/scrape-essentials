import type { ConfigField, ScrapeConfig, ScrapedRecord } from "@/lib/dexie";

export type OAuthTokenResponse = {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
};

export type OAuthRefreshResponse = {
  accessToken: string;
  expiresAt: number;
};

export type ImportPayload = {
  schemaVersion: number;
  configs: ScrapeConfig[];
  fields: ConfigField[];
  records: ScrapedRecord[];
};

export type RestorePayload = {
  payload: ImportPayload;
  backupFileName: string;
  modifiedTime: string;
};

export type BackupMetadata = {
  id: string;
  name: string;
  size: number;
  modifiedTime: string;
  createdTime: string;
  extensionVersion?: string;
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
