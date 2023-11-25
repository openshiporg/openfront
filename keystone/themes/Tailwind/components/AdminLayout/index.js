import { Logo } from "@keystone/components/Logo";
import { useState } from "react";
import { ModeToggle } from "./ModeToggle";
import { MainNav } from "./MainNav";
import { DashboardNav } from "./DashboardNav";
import { useKeystone } from "@keystone/keystoneProvider";
import {
  ArrowRightIcon,
  Home,
  LayoutDashboard,
  StoreIcon,
} from "lucide-react";
import { Button } from "@keystone/primitives/default/ui/button";
import { Collapse } from "./Collapse";
import { Badge } from "@keystone/primitives/default/ui/badge";
import Link from "next/link";
import { ScrollArea } from "@keystone/primitives/default/ui/scroll-area";

export const HEADER_HEIGHT = 80;

export const AdminLayout = ({ children }) => {
  const [open, setOpen] = useState(true);

  const {
    adminMeta: { lists },
    adminConfig,
    authenticatedItem,
    visibleLists,
  } = useKeystone();

  if (visibleLists.state === "loading") return null;
  // This visible lists error is critical and likely to result in a server restart
  // if it happens, we'll show the error and not render the navigation component/s
  if (visibleLists.state === "error") {
    return (
      <span className="text-red-600 dark:text-red-500">
        {visibleLists.error instanceof Error
          ? visibleLists.error.message
          : visibleLists.error[0].message}
      </span>
    );
  }
  const renderableLists = Object.keys(lists)
    .map((key) => {
      if (!visibleLists.lists.has(key)) return null;
      return lists[key];
    })
    .filter((x) => Boolean(x));

  console.log({ renderableLists });

  if (adminConfig?.components?.Navigation) {
    return (
      <adminConfig.components.Navigation
        authenticatedItem={authenticatedItem}
        lists={renderableLists}
      />
    );
  }

  const sidebarNav = renderableLists.map((list) => ({
    title: list.label,
    href: `/${list.path}${list.isSingleton ? "/1" : ""}`,
  }));

  const HEADER_HEIGHT = 120;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <MainNav />
          <div className="end">
            <ModeToggle />
          </div>
        </div>
      </header>
      <div className="container grid flex-1 gap-[4rem] md:grid-cols-[200px_1fr]">
        <aside className="hidden w-[240px] flex-col md:flex max-h-[calc(100vh-4.2rem)]">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="w-full mt-6 text-md text-muted-foreground justify-start"
            >
              <Home className="shadow-xs mr-3 w-6 h-6 p-[.3rem] rounded bg-gradient-to-r from-amber-200 to-amber-300 stroke-amber-700 shadow-xs dark:bg-gradient-to-r dark:from-amber-800/40 dark:to-amber-900 dark:stroke-amber-300" />{" "}
              Home
            </Button>
          </Link>

          <Button
            variant="ghost"
            className="text-md text-muted-foreground justify-start"
            // isDisabled={true}
          >
            <StoreIcon className="shadow-xs mr-3 w-6 h-6 p-[.3rem] rounded bg-gradient-to-r from-green-200 to-green-300 stroke-green-700 shadow-xs dark:bg-gradient-to-r dark:from-green-800/40 dark:to-green-900 dark:stroke-green-300" />
            Storefront
            <Badge className="ml-auto h-4 px-2 text-[10px]" variant="secondary">
              SOON
            </Badge>
          </Button>
          <Link href="/api/graphql">
            <Button
              variant="ghost"
              className="w-full text-md text-muted-foreground justify-start"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="shadow-xs mr-3 w-6 h-6 p-[.3rem] rounded bg-gradient-to-r from-fuchsia-200 to-fuchsia-300 stroke-fuchsia-700 shadow-xs dark:bg-gradient-to-r dark:from-fuchsia-800/40 dark:to-fuchsia-900 dark:stroke-fuchsia-300"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M5.308 7.265l5.385 -3.029"></path>
                <path d="M13.308 4.235l5.384 3.03"></path>
                <path d="M20 9.5v5"></path>
                <path d="M18.693 16.736l-5.385 3.029"></path>
                <path d="M10.692 19.765l-5.384 -3.03"></path>
                <path d="M4 14.5v-5"></path>
                <path d="M12.772 4.786l6.121 10.202"></path>
                <path d="M18.5 16h-13"></path>
                <path d="M5.107 14.988l6.122 -10.201"></path>
                <path d="M12 3.5m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0"></path>
                <path d="M12 20.5m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0"></path>
                <path d="M4 8m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0"></path>
                <path d="M4 16m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0"></path>
                <path d="M20 16m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0"></path>
                <path d="M20 8m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0"></path>
              </svg>
              GraphQL API
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="text-md text-muted-foreground justify-start"
            onClick={() => setOpen(!open)}
          >
            <LayoutDashboard className="shadow-xs mr-3 w-6 h-6 p-[.3rem] rounded bg-gradient-to-r from-blue-200 to-blue-300 stroke-blue-700 shadow-xs dark:bg-gradient-to-r dark:from-blue-800/40 dark:to-blue-900 dark:stroke-blue-300" />
            Admin UI
            {open ? (
              <ArrowRightIcon className="h-4 w-4 ml-auto rounded-sm hover:bg-gray-800/5 dark:hover:bg-gray-100/5 origin-center transition-transform rotate-90" />
            ) : (
              <ArrowRightIcon className="h-4 w-4 ml-auto rounded-sm hover:bg-gray-800/5 dark:hover:bg-gray-100/5 origin-center transition-transform rotate-[-180]" />
            )}
          </Button>
          {/* <ul className="mt-6 mb-[-1.11rem]">
            <li>
              <a className="group flex items-center lg:text-sm lg:leading-6 mb-5 sm:mb-4 font-semibold text-orange-800 dark:text-orange-500/85">
                <StoreIcon className="mr-3 w-6 h-6 p-[.3rem] rounded bg-orange-500/10 stroke-orange-700 shadow-xs dark:bg-orange-900/60 dark:stroke-orange-500/85" />
                Storefront
                <ArrowTopRightIcon className="ml-auto mr-10" />
              </a>
            </li>
            <li>
              <a className="group flex items-center lg:text-sm lg:leading-6 mb-5 sm:mb-4 font-semibold text-green-800 dark:text-green-500/85">
                <BookOpen className="mr-3 w-6 h-6 p-[.3rem] rounded bg-green-500/10 stroke-green-700 shadow-xs dark:bg-green-900/60 dark:stroke-green-500/85" />
                Documentation
                <ArrowTopRightIcon className="ml-auto mr-10" />
              </a>
            </li>
            <li>
              <a className="group flex items-center lg:text-sm lg:leading-6 mb-5 sm:mb-4 font-semibold text-fuchsia-800 dark:text-fuchsia-500/85">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-3 w-6 h-6 p-[.3rem] rounded bg-fuchsia-500/10 stroke-fuchsia-700 shadow-xs dark:bg-fuchsia-900/60 dark:stroke-fuchsia-500/85"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M5.308 7.265l5.385 -3.029"></path>
                  <path d="M13.308 4.235l5.384 3.03"></path>
                  <path d="M20 9.5v5"></path>
                  <path d="M18.693 16.736l-5.385 3.029"></path>
                  <path d="M10.692 19.765l-5.384 -3.03"></path>
                  <path d="M4 14.5v-5"></path>
                  <path d="M12.772 4.786l6.121 10.202"></path>
                  <path d="M18.5 16h-13"></path>
                  <path d="M5.107 14.988l6.122 -10.201"></path>
                  <path d="M12 3.5m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0"></path>
                  <path d="M12 20.5m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0"></path>
                  <path d="M4 8m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0"></path>
                  <path d="M4 16m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0"></path>
                  <path d="M20 16m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0"></path>
                  <path d="M20 8m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0"></path>
                </svg>
                GraphQL API
                <ArrowTopRightIcon className="ml-auto mr-10" />
              </a>
            </li>
            <li>
              <a className="group flex items-center lg:text-sm lg:leading-6 mb-5 sm:mb-4 font-semibold text-blue-800 dark:text-blue-500/85">
                <Terminal className="mr-3 w-6 h-6 p-[.3rem] rounded bg-blue-500/10 stroke-blue-700 shadow-xs dark:bg-blue-900/60 dark:stroke-blue-500/85" />
                Admin UI
                <button className="ml-auto" onClick={() => setOpen(!open)}>
                  {open ? (
                    <ArrowRightIcon className="h-4 w-4 mr-10 rounded-sm hover:bg-gray-800/5 dark:hover:bg-gray-100/5 origin-center transition-transform rotate-90" />
                  ) : (
                    <ArrowRightIcon className="h-4 w-4 mr-10 rounded-sm hover:bg-gray-800/5 dark:hover:bg-gray-100/5 origin-center transition-transform rotate-[-180]" />
                  )}
                </button>
              </a>
            </li>
          </ul> */}
          <Collapse className="h-full" isOpen={open}>
            <DashboardNav items={sidebarNav} />
          </Collapse>
        </aside>
        <main className="max-h-[calc(100vh-7.1rem)]">
          <ScrollArea className="h-full my-6 px-2 pr-12">{children}</ScrollArea>
        </main>
      </div>
    </div>
  );
};
