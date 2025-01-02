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
import {
  ChevronUpIcon,
  UserIcon,
  ArrowRightStartOnRectangleIcon,
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/16/solid";
import { AdminLink } from "../AdminLink";

async function endSession() {
  await keystoneClient.request(`
    mutation EndSession {
      endSession
    }
  `);
}

export function AccountDropdownMobile({ authenticatedItem }) {
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

  if (!authenticatedItem || authenticatedItem.state !== "authenticated")
    return null;

  return (
    <Dropdown>
      <DropdownButton className="lg:hidden">
        <Avatar
          className="size-8 bg-zinc-900 text-white dark:bg-white dark:text-black"
          square
          initials={
            authenticatedItem.label
              ? Array.from(authenticatedItem.label)[0]
              : "?"
          }
          alt=""
        />
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
  );
}
