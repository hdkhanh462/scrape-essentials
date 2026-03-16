import { toast } from "sonner";
import { logger } from "@/utils/logger";

export const toastError = (
  error: Error,
  title?: string,
  description?: string,
) => {
  logger.error("Error:", error);
  toast.error(title || "Error", {
    description: description || error.message,
  });
};
