import type {
  AddFieldPayload,
  EditFieldPayload,
  GetFieldsPayload,
} from "@/features/fields/types";
import { type ConfigField, dexie } from "@/lib/dexie";

export const getFields = async (
  payload: GetFieldsPayload,
): Promise<ConfigField[]> => {
  if (!payload.configId) return [];

  return await dexie.configFields
    .where("configId")
    .equals(payload.configId)
    .and((f) =>
      payload.isShowOnTable === undefined
        ? true
        : f.isShowOnTable === payload.isShowOnTable,
    )
    .sortBy("order");
};

export const addField = async (
  payload: AddFieldPayload,
): Promise<ConfigField["id"]> => {
  return await dexie.transaction(
    "rw",
    dexie.scrapeConfigs,
    dexie.configFields,
    async (tx) => {
      const config = await tx.scrapeConfigs.get(payload.configId);
      if (!config) throw new Error("Config not found");

      const newFieldId = await tx.configFields.add(
        fieldInputToDb(payload, payload.configId),
      );
      const row = await tx.scrapeConfigs.update(payload.configId, {
        updatedAt: new Date().toISOString(),
      });
      if (row === 0) throw new Error("Failed to update config");

      return newFieldId;
    },
  );
};

export const editField = async (
  payload: EditFieldPayload,
): Promise<boolean> => {
  return await dexie.transaction(
    "rw",
    dexie.scrapeConfigs,
    dexie.configFields,
    async (tx) => {
      const field = await tx.configFields.get(payload.id);
      if (!field) throw new Error("Field not found");

      const row = await tx.configFields.update(
        payload.id,
        fieldInputToDb(payload.data, payload.data.configId, payload.id),
      );
      const configRow = await tx.scrapeConfigs.update(payload.data.configId, {
        updatedAt: new Date().toISOString(),
      });

      return row > 0 && configRow > 0;
    },
  );
};

export const deleteField = async (id: ConfigField["id"]): Promise<boolean> => {
  return await dexie.transaction(
    "rw",
    dexie.scrapeConfigs,
    dexie.configFields,
    async (tx) => {
      const field = await tx.configFields.get(id);
      if (!field) throw new Error("Field not found");

      await tx.configFields.delete(id);
      const configRow = await tx.scrapeConfigs.update(field.configId, {
        updatedAt: new Date().toISOString(),
      });
      return configRow > 0;
    },
  );
};
