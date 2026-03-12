import type { ScrapedRecordInput } from "@/features/scraped-records/types/form-input";
import { dexie, type ScrapeConfig, type ScrapedRecord } from "@/lib/dexie";
import { dexieApi } from "@/lib/redux/dexie.api";

type DataInput<T = ScrapedRecordInput> = {
  id: ScrapedRecord["id"];
  data: T;
};

export const recordApi = dexieApi.injectEndpoints({
  endpoints: (builder) => ({
    getScrapedRecords: builder.query<
      ScrapedRecord[],
      {
        configId?: ScrapeConfig["id"];
      }
    >({
      providesTags: ["ScrapedRecords"],
      queryFn: async (payload) => {
        if (!payload.configId) return { data: [] };

        const data = await dexie.scrapedRecords
          .where("configId")
          .equals(payload.configId)
          .toArray();
        return { data };
      },
    }),
    getScrapedRecord: builder.query<
      ScrapedRecord | undefined,
      Partial<Pick<ScrapedRecord, "id" | "key">>
    >({
      providesTags: ["ScrapedRecords"],
      queryFn: async (payload) => {
        if (!payload.id || !payload.key) return { data: undefined };
        const data = await dexie.scrapedRecords
          .where({ configId: payload.id, key: payload.key })
          .first();
        return { data };
      },
    }),
    importRecords: builder.mutation<boolean, ScrapedRecord[]>({
      invalidatesTags: ["ScrapedRecords"],
      queryFn: async (payload) => {
        await dexie.scrapedRecords.clear();
        await dexie.scrapedRecords.bulkAdd(payload);
        return { data: true };
      },
    }),
    addScrapedRecord: builder.mutation<ScrapedRecord["id"], DataInput>({
      invalidatesTags: ["ScrapedRecords"],
      queryFn: async (payload) => {
        const exists = await dexie.scrapedRecords
          .where({ configId: payload.id, key: payload.data.key })
          .first();
        if (exists) {
          return {
            error: "Scraped data with the same key value already exists",
          };
        }
        const now = new Date().toISOString();
        const newId = await dexie.scrapedRecords.add({
          ...payload.data,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        });
        return { data: newId };
      },
    }),
    editScrapedRecord: builder.mutation<
      boolean,
      DataInput<Pick<ScrapedRecordInput, "data">>
    >({
      invalidatesTags: ["ScrapedRecords"],
      queryFn: async (payload) => {
        const row = await dexie.scrapedRecords.update(payload.id, {
          ...payload.data,
          updatedAt: new Date().toISOString(),
        });
        return { data: row > 0 };
      },
    }),
    deleteScrapedRecord: builder.mutation<boolean, ScrapedRecord["id"]>({
      invalidatesTags: ["ScrapedRecords"],
      queryFn: async (id) => {
        await dexie.scrapedRecords.delete(id);
        return { data: true };
      },
    }),
  }),
});
