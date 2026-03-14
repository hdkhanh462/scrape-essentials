import type { ImportPayload } from "@/features/backup/types";
import type { ConfigInput } from "@/features/configs/types/form-input";
import type { ScrapeConfig } from "@/lib/dexie";
import type { PayloadWithId } from "@/types/common";

export type GetConfigsPayload = Pick<ScrapeConfig, "isActive">;

export type ImportConfigsPayload = Omit<ImportPayload, "records">;

export type AddConfigPayload = ConfigInput;

export type EditConfigPayload = PayloadWithId<Omit<ConfigInput, "fields">>;

export type ToggleConfigActivePayload = PayloadWithId<
  Pick<ScrapeConfig, "isActive">
>;
