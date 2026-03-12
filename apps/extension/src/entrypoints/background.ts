import { initTRPC } from "@trpc/server";
import { createChromeHandler } from "trpc-chrome/adapter";
import z from "zod";
import { getCurrentPage } from "@/features/scraped-records/utils/scraper";

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
