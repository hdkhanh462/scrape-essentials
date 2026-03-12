import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

export const dexieApi = createApi({
  reducerPath: "dexieApi",
  tagTypes: ["ScrapeConfigs", "ConfigFields", "ScrapedRecords"],
  baseQuery: fakeBaseQuery(),
  endpoints: () => ({}),
});
