import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { trpc } from "@/lib/trpc";

export const scrapingApi = createApi({
  reducerPath: "scrapingApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getCurrentPage: builder.query({
      queryFn: async () => {
        const data = await trpc.getCurrentPage.query();
        return { data };
      },
    }),
  }),
});

export const { useGetCurrentPageQuery } = scrapingApi;
