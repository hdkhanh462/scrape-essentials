import type { FieldInput } from "@/features/config-fields/types/form-input";
import { type ConfigField, dexie, type ScrapeConfig } from "@/lib/dexie";
import { dexieApi } from "@/lib/redux/dexie.api";

type DataInput<T = FieldInput> = {
  id: ConfigField["id"];
  data: T;
};

export const fieldApi = dexieApi.injectEndpoints({
  endpoints: (builder) => ({
    getFields: builder.query<
      ConfigField[],
      {
        configId?: ScrapeConfig["id"];
      } & Pick<ConfigField, "isShowOnTable">
    >({
      providesTags: ["ConfigFields"],
      queryFn: async (payload) => {
        if (!payload.configId) return { data: [] };
        const data = await dexie.configFields
          .where("configId")
          .equals(payload.configId)
          .and((f) =>
            payload.isShowOnTable === undefined
              ? true
              : f.isShowOnTable === payload.isShowOnTable,
          )
          .sortBy("order");
        return { data };
      },
    }),
    addField: builder.mutation<
      ConfigField["id"],
      FieldInput & { configId: ScrapeConfig["id"] }
    >({
      invalidatesTags: ["ConfigFields", "ScrapeConfigs"],
      queryFn: async (payload) => {
        const newFieldId = await dexie.transaction(
          "rw",
          dexie.scrapeConfigs,
          dexie.configFields,
          async (tx) => {
            const config = await tx.scrapeConfigs.get(payload.configId);
            if (!config) throw new Error("Config not found");

            const newFieldId = await tx.configFields.add(
              fieldInputToDb(payload, payload.configId),
            );
            const configRow = await tx.scrapeConfigs.update(payload.configId, {
              updatedAt: new Date().toISOString(),
            });
            if (configRow === 0) throw new Error("Failed to update config");

            return newFieldId;
          },
        );

        return { data: newFieldId };
      },
    }),
    editField: builder.mutation<
      boolean,
      DataInput<FieldInput & { configId: ScrapeConfig["id"] }>
    >({
      invalidatesTags: ["ConfigFields", "ScrapeConfigs"],
      queryFn: async (payload) => {
        const isSuccess = await dexie.transaction(
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
            const configRow = await tx.scrapeConfigs.update(
              payload.data.configId,
              {
                updatedAt: new Date().toISOString(),
              },
            );

            return row > 0 && configRow > 0;
          },
        );
        return { data: isSuccess };
      },
    }),
    deleteField: builder.mutation<boolean, ConfigField["id"]>({
      invalidatesTags: ["ConfigFields", "ScrapeConfigs"],
      queryFn: async (id) => {
        const isSuccess = await dexie.transaction(
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

        return { data: isSuccess };
      },
    }),
  }),
});
