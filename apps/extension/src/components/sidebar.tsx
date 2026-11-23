import { BoxIcon, SettingsIcon, WrenchIcon } from "lucide-react";
import { Activity, type PropsWithChildren } from "react";

import { useOptionsStore } from "@/features/shared/stores/options.store";

export const sidebarItems = [
  { id: "configs", labelKey: "config:navLabel", icon: WrenchIcon },
  { id: "records", labelKey: "record:navLabel", icon: BoxIcon },
  { id: "settings", labelKey: "settings:label", icon: SettingsIcon },
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
