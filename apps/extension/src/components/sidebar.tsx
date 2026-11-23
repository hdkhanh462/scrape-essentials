import { BoxIcon, SettingsIcon, WrenchIcon } from "lucide-react";
import { Activity, type PropsWithChildren } from "react";

import { useOptionsStore } from "@/features/shared/stores/options.store";

export const sidebarItems = [
  { id: "configs", label: "Configs", icon: WrenchIcon },
  { id: "records", label: "Records", icon: BoxIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
] as const;

export type SidebarTab = (typeof sidebarItems)[number]["id"];

export function SidebarContent({
  value,
  children,
}: { value: SidebarTab } & PropsWithChildren) {
  const { activeTab } = useOptionsStore();

  return (
    <Activity mode={value === activeTab ? "visible" : "hidden"}>
      {children}
    </Activity>
  );
}
