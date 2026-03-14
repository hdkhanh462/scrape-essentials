import { dexie, type ScrapeConfig } from "@/lib/dexie";
import { fieldInputToDb } from "@/utils/convers";

import type {
  AddConfigPayload,
  EditConfigPayload,
  GetConfigsPayload,
  ImportConfigsPayload,
  ToggleConfigActivePayload,
} from "@/features/configs/types";

export const getConfigs = async (
  payload: GetConfigsPayload,
): Promise<ScrapeConfig[]> => {
  return await dexie.scrapeConfigs
    .filter((c) =>
      payload.isActive === undefined ? true : c.isActive === payload.isActive,
    )
    .reverse()
    .sortBy("createdAt");
};

export const importConfigs = async (
  payload: ImportConfigsPayload,
): Promise<boolean> => {
  return await dexie.transaction(
    "rw",
    dexie.scrapeConfigs,
    dexie.configFields,
    async (tx) => {
      await tx.scrapeConfigs.clear();
      await tx.scrapeConfigs.bulkAdd(payload.configs);
      await tx.configFields.clear();
      await tx.configFields.bulkAdd(payload.fields);
      return true;
    },
  );
};

export const addConfig = async (
  payload: AddConfigPayload,
): Promise<ScrapeConfig["id"]> => {
  const now = new Date().toISOString();
  return await dexie.transaction(
    "rw",
    dexie.scrapeConfigs,
    dexie.configFields,
    async (tx) => {
      const newConfigId = await tx.scrapeConfigs.add({
        id: crypto.randomUUID(),
        name: payload.name,
        isActive: payload.isActive,
        domains: payload.domains.map((d) => d.value),
        createdAt: now,
        updatedAt: now,
      });
      const fields = payload.fields.map((field) =>
        fieldInputToDb(field, newConfigId),
      );
      await tx.configFields.bulkAdd(fields);
      return newConfigId;
    },
  );
};

export const editConfig = async (
  payload: EditConfigPayload,
): Promise<boolean> => {
  const row = await dexie.scrapeConfigs.update(payload.id, {
    name: payload.data.name,
    isActive: payload.data.isActive,
    domains: payload.data.domains.map((d) => d.value),
    updatedAt: new Date().toISOString(),
  });
  return row > 0;
};

export const toggleConfigActive = async (
  payload: ToggleConfigActivePayload,
): Promise<boolean> => {
  const row = await dexie.scrapeConfigs.update(payload.id, {
    isActive: payload.data.isActive,
    updatedAt: new Date().toISOString(),
  });
  return row > 0;
};

export const duplicateConfig = async (
  configId: ScrapeConfig["id"],
): Promise<ScrapeConfig["id"]> => {
  return await dexie.transaction(
    "rw",
    dexie.scrapeConfigs,
    dexie.configFields,
    async (tx) => {
      const config = await tx.scrapeConfigs.get(configId);
      if (!config) throw new Error("Config not found");

      const fields = await tx.configFields
        .where("configId")
        .equals(configId)
        .toArray();

      const now = new Date().toISOString();

      const newConfigId = await tx.scrapeConfigs.add({
        id: crypto.randomUUID(),
        name: `${config.name} (Copy)`,
        isActive: config.isActive,
        domains: config.domains,
        createdAt: now,
        updatedAt: now,
      });

      await tx.configFields.bulkAdd(
        fields.map((field) => ({
          ...field,
          id: crypto.randomUUID(),
          configId: newConfigId,
        })),
      );

      return newConfigId;
    },
  );
};

export const deleteConfig = async (
  configId: ScrapeConfig["id"],
): Promise<boolean> => {
  return await dexie.transaction(
    "rw",
    dexie.scrapeConfigs,
    dexie.configFields,
    async (tx) => {
      await tx.configFields.where("configId").equals(configId).delete();
      await tx.scrapeConfigs.delete(configId);
      return true;
    },
  );
};
