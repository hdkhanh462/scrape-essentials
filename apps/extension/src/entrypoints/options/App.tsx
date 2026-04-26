import { Sidebar, SidebarContent } from "@/components/sidebar";
import { ConfigContainer } from "@/features/configs/components/config-container";
import { RecordContainer } from "@/features/records/components/record-container";
import { SettingsContainer } from "@/features/settings/components/settings-container";

function App() {
  return (
    <Sidebar>
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
    </Sidebar>
  );
}

export default App;
