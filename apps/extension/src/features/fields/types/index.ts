import type { FieldInput } from "@/features/fields/types/form-input";
import type { ConfigField, ScrapeConfig } from "@/lib/dexie";
import type { PayloadWithId } from "@/types/common";

export type GetFieldsPayload = {
  configId?: ScrapeConfig["id"];
} & Pick<ConfigField, "isShowOnTable">;

export type AddFieldPayload = FieldInput & { configId: ScrapeConfig["id"] };

export type EditFieldPayload = PayloadWithId<
  FieldInput & { configId: ScrapeConfig["id"] }
>;
