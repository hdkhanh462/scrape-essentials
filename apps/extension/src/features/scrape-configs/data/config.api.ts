import type { ConfigInput } from "@/features/scrape-configs/types/form-input";
import { type ConfigField, dexie, type ScrapeConfig } from "@/lib/dexie";
import { dexieApi } from "@/lib/redux/dexie.api";

type DataInput<T = ConfigInput> = {
  id: ScrapeConfig["id"];
  data: T;
};

export type ImportConfigsPayload = {
  allConfigs: ScrapeConfig[];
  allConfigFields: ConfigField[];
};

export const configApi = dexieApi.injectEndpoints({
  endpoints: (builder) => ({
    getConfigs: builder.query<ScrapeConfig[], Pick<ScrapeConfig, "isActive">>({
      providesTags: ["ScrapeConfigs"],
      queryFn: async (payload) => {
        const data = await dexie.scrapeConfigs
          // .where("isActive")
          // .equals(1)
          .filter((c) =>
            payload.isActive === undefined
              ? true
              : c.isActive === payload.isActive,
          )
          .reverse()
          .sortBy("createdAt");
        return { data };
      },
    }),
    importConfigs: builder.mutation<boolean, ImportConfigsPayload>({
      invalidatesTags: ["ScrapeConfigs", "ConfigFields"],
      queryFn: async (payload) => {
        const result = await dexie.transaction(
          "rw",
          dexie.scrapeConfigs,
          dexie.configFields,
          async (tx) => {
            await tx.scrapeConfigs.clear();
            await tx.scrapeConfigs.bulkAdd(payload.allConfigs);
            await tx.configFields.clear();
            await tx.configFields.bulkAdd(payload.allConfigFields);
            return true;
          },
        );
        return { data: result };
      },
    }),
    addConfig: builder.mutation<ScrapeConfig["id"], ConfigInput>({
      invalidatesTags: ["ScrapeConfigs"],
      queryFn: async (payload) => {
        const now = new Date().toISOString();
        const newConfigId = await dexie.transaction(
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

        return { data: newConfigId };
      },
    }),
    editConfig: builder.mutation<
      boolean,
      DataInput<Omit<ConfigInput, "fields">>
    >({
      invalidatesTags: ["ScrapeConfigs"],
      queryFn: async (payload) => {
        const row = await dexie.scrapeConfigs.update(payload.id, {
          name: payload.data.name,
          isActive: payload.data.isActive,
          domains: payload.data.domains.map((d) => d.value),
          updatedAt: new Date().toISOString(),
        });
        return { data: row > 0 };
      },
    }),
    toggleConfigActive: builder.mutation<
      boolean,
      DataInput<Pick<ScrapeConfig, "isActive">>
    >({
      invalidatesTags: ["ScrapeConfigs"],
      queryFn: async (payload) => {
        const row = await dexie.scrapeConfigs.update(payload.id, {
          isActive: payload.data.isActive,
          updatedAt: new Date().toISOString(),
        });
        return { data: row > 0 };
      },
    }),
    duplicateConfig: builder.mutation<ScrapeConfig["id"], ScrapeConfig["id"]>({
      invalidatesTags: ["ScrapeConfigs", "ConfigFields"],
      queryFn: async (configId) => {
        const newConfigId = await dexie.transaction(
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
        return { data: newConfigId };
      },
    }),
    deleteConfig: builder.mutation<boolean, ScrapeConfig["id"]>({
      invalidatesTags: ["ScrapeConfigs", "ConfigFields"],
      queryFn: async (configId) => {
        const isSuccess = await dexie.transaction(
          "rw",
          dexie.scrapeConfigs,
          dexie.configFields,
          async (tx) => {
            await tx.configFields.where("configId").equals(configId).delete();
            await tx.scrapeConfigs.delete(configId);
            return true;
          },
        );
        return { data: isSuccess };
      },
    }),
  }),
});
