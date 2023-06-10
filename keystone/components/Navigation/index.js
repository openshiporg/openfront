import { NavigationUI } from "./NavigationUI";

const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";

const { NavItem, NavigationContainer, ListNavItem, ListNavItems, Navigation } =
  NavigationUI[appTheme];

export { NavItem, NavigationContainer, ListNavItem, ListNavItems, Navigation };
