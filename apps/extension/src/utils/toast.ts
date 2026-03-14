import { toast } from "sonner";

export const toastError = (
  error: Error,
  title?: string,
  description?: string,
) => {
  console.error("Error:", error);
  toast.error(title || "Error", {
    description: description || error.message,
  });
};
