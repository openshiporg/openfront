import { NavigationSidebar } from "./NavigationSidebar";
import { AppProvider } from "./AppProvider";
import { getKeystoneMetadata } from "../../lib/keystoneMetadataQueries";

export const HEADER_HEIGHT = 80;

export async function DashboardLayout({ children }) {
  const { adminMeta: lists, authenticatedItem } = await getKeystoneMetadata();

  const visibleLists = {
    state: "ready",
    lists: new Set(Object.keys(lists)),
  };

  const renderableLists = Object.keys(lists)
    .map((key) => {
      if (!visibleLists.lists.has(key)) return null;
      return lists[key];
    })
    .filter((x) => Boolean(x));

  // if (adminConfig?.components?.Navigation) {
  //   return (
  //     <adminConfig.components.Navigation
  //       authenticatedItem={authenticatedItem}
  //       lists={renderableLists}
  //     />
  //   );
  // }

  const sidebarLinks = renderableLists.map((list) => ({
    title: list.label,
    href: `/${list.path}${list.isSingleton ? "/1" : ""}`,
  }));

  return (
    <AppProvider>
      <NavigationSidebar
        authenticatedItem={authenticatedItem}
        sidebarLinks={sidebarLinks}
      >
        {children}
      </NavigationSidebar>
    </AppProvider>
  );
}
