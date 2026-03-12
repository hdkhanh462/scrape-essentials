import { createTRPCProxyClient } from "@trpc/client";
import { chromeLink } from "trpc-chrome/link";

import type { AppRouter } from "@/entrypoints/background";

const port = browser.runtime.connect();
const trpc = createTRPCProxyClient<AppRouter>({
  links: [chromeLink({ port })],
});

export { trpc };
