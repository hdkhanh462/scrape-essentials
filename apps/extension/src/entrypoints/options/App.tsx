import { Sidebar, SidebarContent } from "@/components/sidebar";
import { ConfigContainer } from "@/features/configs/components/config-container";
import { RecordsContainer } from "@/features/records/components/scrape-records-container";
import { SettingsContainer } from "@/features/settings/components/settings-container";

function App() {
  return (
    <Sidebar>
      <div className="container mx-auto p-4">
        <SidebarContent value="configs">
          <ConfigContainer />
        </SidebarContent>
        <SidebarContent value="records">
          <RecordsContainer />
        </SidebarContent>
        <SidebarContent value="settings">
          <SettingsContainer />
        </SidebarContent>
      </div>
    </Sidebar>
  );
}

export default App;
