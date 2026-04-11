import React from "react";
import { logger } from "@/utils/logger";

type Options = {
  timeout?: number;
  onCopy?: () => void;
};

export function useCopyToClipboard(options: Options = { timeout: 2000 }) {
  const [isCopied, setIsCopied] = React.useState(false);

  const copy = (value: string) => {
    if (typeof window === "undefined" || !navigator.clipboard.writeText) {
      return;
    }

    if (!value) return;

    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);
      options.onCopy?.();

      if (options.timeout !== 0) {
        setTimeout(() => {
          setIsCopied(false);
        }, options.timeout);
      }
    }, logger.error);
  };

  return { isCopied, copy };
}
