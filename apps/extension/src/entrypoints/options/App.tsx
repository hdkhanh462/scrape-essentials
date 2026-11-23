import { AppSidebar } from "@/components/app-sidebar";
import { SidebarContent, sidebarItems } from "@/components/sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ConfigContainer } from "@/features/configs/components/config-container";
import { RecordContainer } from "@/features/records/components/record-container";
import { SettingsContainer } from "@/features/settings/components/settings-container";
import { useOptionsStore } from "@/features/shared/stores/options.store";

function App() {
  const { activeTab } = useOptionsStore();
  const activeItem = sidebarItems.find((item) => item.id === activeTab);

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar />
      <SidebarInset className="h-svh min-h-0 overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <span className="font-medium">{activeItem?.label}</span>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="container mx-auto p-4">
            <SidebarContent value="configs">
              <ConfigContainer />
            </SidebarContent>
            <SidebarContent value="records">
              <RecordContainer />
            </SidebarContent>
            <SidebarContent value="settings">
              <SettingsContainer />
            </SidebarContent>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
