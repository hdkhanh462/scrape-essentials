import { BoxIcon, SettingsIcon, WrenchIcon } from "lucide-react";
import { Activity, type PropsWithChildren } from "react";

import { buttonVariants } from "@/components/ui/button";
import { useOptionsStore } from "@/features/shared/stores/options.store";
import { cn } from "@/lib/utils";

export const sidebarItems = [
  { id: "configs", label: "Configs", icon: WrenchIcon },
  { id: "data", label: "Data", icon: BoxIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
] as const;

export type SidebarTab = (typeof sidebarItems)[number]["id"];

export function Sidebar({ children }: PropsWithChildren) {
  const { activeTab, setActiveTab } = useOptionsStore();

  return (
    <div className="flex h-screen">
      <div className="w-56 shrink-0 border-r p-4">
        <ul className="flex flex-col gap-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <li
                key={item.id}
                className={buttonVariants({
                  variant: "ghost",
                  className: cn(
                    "cursor-pointer justify-start",
                    isActive && "bg-accent text-accent-foreground",
                  ),
                })}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={16} /> {item.label}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

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
