import { useOptionsStore } from "@/features/shared/stores/options.store";
import { OnChangeFn, VisibilityState } from "@tanstack/react-table";

export const useColumnVisibility = () => {
  const { columnVisibility, setColumnVisibility } = useOptionsStore();
  const onChange: OnChangeFn<VisibilityState> = (updater) => {
    typeof updater === "function"
      ? setColumnVisibility(updater(columnVisibility))
      : setColumnVisibility(updater);
  };
  return { value: columnVisibility, onChange };
};
