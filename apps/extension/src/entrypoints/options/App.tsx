import { Sidebar, SidebarContent } from "@/components/sidebar";
import { ConfigsContainer } from "@/features/scrape-configs/components/scrape-configs-container";
import { RecordsContainer } from "@/features/scraped-records/components/scrape-records-container";
import { SettingsContainer } from "@/features/settings/components/settings-container";

function App() {
  return (
    <Sidebar>
      <div className="container mx-auto p-4">
        <SidebarContent value="configs">
          <ConfigsContainer />
        </SidebarContent>
        <SidebarContent value="data">
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
