import type {
  AddConfigPayload,
  EditConfigPayload,
  GetConfigsPayload,
  ImportConfigsPayload,
  ToggleConfigActivePayload,
} from "@/features/configs/types";
import { dexie, type ScrapeConfig } from "@/lib/dexie";
import { fieldInputToDb } from "@/utils/converts";
import { logger } from "@/utils/logger";

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

export const getConfigById = async (payload: {
  id: ScrapeConfig["id"];
  isActive?: boolean;
}): Promise<ScrapeConfig | undefined> => {
  const config = await dexie.scrapeConfigs
    .where("id")
    .equals(payload.id)
    .filter((c) =>
      payload.isActive === undefined ? true : c.isActive === payload.isActive,
    )
    .first();
  return config;
};

export const getConfigTags = async (): Promise<ScrapeConfig["tags"]> => {
  const configs = await dexie.scrapeConfigs
    .filter((c) => c.tags && c.tags.length > 0)
    .reverse()
    .sortBy("createdAt");

  return [
    ...new Set(
      configs.flatMap((config) => config.tags.map((tag) => tag.toLowerCase())),
    ),
  ];
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
        tags: payload.tags,
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
  const isSuccess = await dexie.transaction(
    "rw",
    dexie.scrapeConfigs,
    dexie.configFields,
    async (tx) => {
      logger.debug("Editing config with fields:", {
        fields: payload.data.fields,
      });

      const row = await tx.scrapeConfigs.update(payload.id, {
        name: payload.data.name,
        isActive: payload.data.isActive,
        tags: payload.data.tags,
        domains: payload.data.domains.map((d) => d.value),
        updatedAt: new Date().toISOString(),
      });
      const oldFields = await tx.configFields
        .where("configId")
        .equals(payload.id)
        .toArray();

      // Delete fields of the config
      await tx.configFields.where("configId").equals(payload.id).delete();

      // When editing a config, we want to keep the same field id if the field is not changed,
      // so we need to find the old field by fieldId and use its id if it exists
      const fieldsToPut = payload.data.fields.map((field) => {
        const oldField = oldFields.find((f) => f.id === field.fieldId);
        return {
          ...fieldInputToDb(field, payload.id),
          id: oldField ? oldField.id : crypto.randomUUID(),
        };
      });

      await tx.configFields.bulkPut(fieldsToPut);

      return row > 0;
    },
  );

  return isSuccess;
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
        tags: config.tags,
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

export const deleteMultipleConfigs = async (
  ids: ScrapeConfig["id"][],
): Promise<boolean> => {
  await dexie.scrapeConfigs.bulkDelete(ids);
  return true;
};
