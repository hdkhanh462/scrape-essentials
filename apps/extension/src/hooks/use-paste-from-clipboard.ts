import React from "react";
import { logger } from "@/utils/logger";

type Options = {
  timeout?: number;
  onPaste?: (text: string) => void;
};

export function usePasteFromClipboard({
  timeout = 2000,
  onPaste,
}: Options = {}) {
  const [isPasted, setIsPasted] = React.useState(false);

  const paste = () => {
    if (typeof window === "undefined") {
      return;
    }

    navigator.clipboard.readText().then((text) => {
      setIsPasted(true);
      onPaste?.(text);

      if (timeout !== 0) {
        setTimeout(() => {
          setIsPasted(false);
        }, timeout);
      }
    }, logger.error);
  };

  return { isPasted, paste };
}
