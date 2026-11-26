"use client";

import {
  ChevronsUpDownIcon,
  CloudIcon,
  LogOutIcon,
  SettingsIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useConnectGoogle, useDisconnectGoogle } from "@/features/backup/hooks";
import { useGoogleStore } from "@/features/backup/stores/google.store";
import { useOptionsStore } from "@/features/shared/stores/options.store";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { t } = useTranslation();
  const { userInfo } = useGoogleStore();
  const setActiveTab = useOptionsStore((state) => state.setActiveTab);
  const connectMutation = useConnectGoogle();
  const disconnectMutation = useDisconnectGoogle();

  const openSettings = () => setActiveTab("settings");

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar size="lg" className="group-data-[collapsible=icon]:size-8!">
              {userInfo ? (
                <AvatarImage src={userInfo.picture} alt={userInfo.name} />
              ) : null}
              <AvatarFallback>
                {userInfo ? userInfo.name.slice(0, 2).toUpperCase() : "N/A"}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {userInfo?.name ?? t("backup:notSignedIn")}
              </span>
              <span className="truncate text-xs">
                {userInfo?.email ?? t("backup:connectGoogleDrive")}
              </span>
            </div>
            <ChevronsUpDownIcon className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar>
                    {userInfo ? (
                      <AvatarImage src={userInfo.picture} alt={userInfo.name} />
                    ) : null}
                    <AvatarFallback>
                      {userInfo
                        ? userInfo.name.slice(0, 2).toUpperCase()
                        : "N/A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {userInfo?.name ?? t("backup:notSignedIn")}
                    </span>
                    <span className="truncate text-xs">
                      {userInfo?.email ?? t("backup:connectGoogleDrive")}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {userInfo ? (
                <>
                  <DropdownMenuItem onClick={openSettings}>
                    <SettingsIcon />
                    {t("settings:label")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("settings")}>
                    <CloudIcon />
                    {t("backup:googleDrive")}
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem
                  onClick={() => connectMutation.mutate()}
                  disabled={connectMutation.isPending}
                >
                  <CloudIcon />
                  {t("backup:connectGoogleDrive")}
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            {userInfo ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => disconnectMutation.mutate()}
                  disabled={disconnectMutation.isPending}
                >
                  <LogOutIcon />
                  {t("backup:disconnect")}
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
