"use client";

import { useTheme } from "next-themes";
import { keystoneClient } from "@keystone/keystoneClient";
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
  DropdownItem,
  DropdownDivider,
  DropdownLabel,
} from "../../primitives/default/ui/dropdown-menu";
import { Avatar } from "../../primitives/default/ui/avatar";
import { Skeleton } from "../../primitives/default/ui/skeleton";
import {
  ChevronUpIcon,
  UserIcon,
  ArrowRightStartOnRectangleIcon,
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/16/solid";
import { SidebarItem } from "../../primitives/default/ui/sidebar";
import { AdminLink } from "../AdminLink";

async function endSession() {
  await keystoneClient.request(`
    mutation EndSession {
      endSession
    }
  `);
}

export function AccountDropdown({ authenticatedItem }) {
  const { setTheme, theme } = useTheme();

  const handleLogout = async () => {
    try {
      await endSession();
      window.location.reload();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const toggleTheme = (e) => {
    e.preventDefault();
    setTheme(themeOptions[theme].next);
  };

  const themeOptions = {
    light: { next: "dark", icon: <SunIcon />, label: "Light Mode" },
    dark: { next: "system", icon: <MoonIcon />, label: "Dark Mode" },
    system: {
      next: "light",
      icon: <ComputerDesktopIcon />,
      label: "System Mode",
    },
  };

  if (!authenticatedItem || authenticatedItem.state !== "authenticated") {
    return (
      <div className="px-2 py-2 flex min-w-0 items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="min-w-0">
          <Skeleton className="h-5 w-24 mb-1" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  return (
    <Dropdown>
      <DropdownButton as={SidebarItem}>
        <span className="flex min-w-0 items-center gap-3">
          <Avatar
            className="size-10 bg-zinc-900 text-white dark:bg-white dark:text-black"
            square
            initials={
              authenticatedItem.label
                ? Array.from(authenticatedItem.label)[0]
                : "?"
            }
            alt=""
          />
          <span className="min-w-0">
            <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
              {authenticatedItem.label}
            </span>
            <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
              {authenticatedItem.email}
            </span>
          </span>
        </span>
        <ChevronUpIcon />
      </DropdownButton>
      <DropdownMenu className="min-w-56" anchor="top">
        <DropdownItem
          as={AdminLink}
          href={`/${authenticatedItem.listKey.toLowerCase()}s/${authenticatedItem.id}`}
        >
          <UserIcon />
          <DropdownLabel>My profile</DropdownLabel>
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem onClick={toggleTheme}>
          {themeOptions[theme]?.icon}
          <DropdownLabel>{themeOptions[theme]?.label}</DropdownLabel>
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem onClick={handleLogout}>
          <ArrowRightStartOnRectangleIcon />
          <DropdownLabel>Sign out</DropdownLabel>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
    // <div>{JSON.stringify({ authenticatedItem })}</div>
  );
}
