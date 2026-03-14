import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
    mutations: {
      onError: (error) => {
        toast.error("Something went wrong!", {
          description: error.message,
        });
      },
      onSettled: (...params) => {
        const { meta } = params[4];

        if (meta?.invalidateQueries) {
          queryClient.invalidateQueries({
            queryKey: meta.invalidateQueries,
            type: "active",
          });
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      toast.error("Something went wrong!", {
        description: error.message,
        action: {
          label: "Retry",
          onClick: query.invalidate,
        },
      });
    },
  }),
});
