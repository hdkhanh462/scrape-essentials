import { initTRPC } from "@trpc/server";
import { createChromeHandler } from "trpc-chrome/adapter";
import z from "zod";
import { uploadToDrive } from "@/features/backup/utils/drive";
import { getAuthToken } from "@/features/backup/utils/identity";
import { getCurrentPage } from "@/features/scraped-records/utils/scraper";
import { dexie } from "@/lib/dexie";

const t = initTRPC.create({
  isServer: false,
  allowOutsideOfServer: true,
});

const appRouter = t.router({
  openNewTab: t.procedure
    .input(z.object({ url: z.url() }))
    .mutation(async ({ input }) => {
      await browser.tabs.create({ url: input.url, active: true });
    }),
  getCurrentPage: t.procedure.query(async () => {
    const result = await getCurrentPage();
    return result;
  }),
  backupToDrive: t.procedure.mutation(async () => {
    const token = await getAuthToken();
    const data = await dexie.scrapeConfigs.toArray();
    const result = await uploadToDrive(token, data);

    console.info("Uploaded:", result);

    return result;
  }),
});

export type AppRouter = typeof appRouter;

export default defineBackground(() => {
  console.info("Hello from background!", { id: browser.runtime.id });

  createChromeHandler({
    router: appRouter,
    createContext: undefined,
    onError: undefined,
  });
});
