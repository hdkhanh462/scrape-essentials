import { initTRPC } from "@trpc/server";
import { createChromeHandler } from "trpc-chrome/adapter";
import z from "zod";
import { backupToDrive } from "@/features/backup/services";
import { getCurrentPage } from "@/features/records/utils/scraper";
import { onMessage } from "@/lib/messaging";

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

  browser.alarms.create("test", { delayInMinutes: 1 });

  browser.alarms.create("dailyBackup", {
    periodInMinutes: 60 * 24,
  });

  browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "test") {
      console.log("Test alarm triggered");
    }
    if (alarm.name === "dailyBackup") {
      console.log("Running daily backup");
      await backupToDrive();
    }
  });

  onMessage("getCurrentPage", async () => {
    const result = await getCurrentPage();
    return result;
  });

  createChromeHandler({
    router: appRouter,
    createContext: undefined,
    onError: undefined,
  });
});
