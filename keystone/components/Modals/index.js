import { ModalsUI } from "./ModalsUI";

const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";

const { Drawer, DRAWER_WIDTHS, DrawerProvider, DrawerController, AlertDialog } =
  ModalsUI[appTheme];

export { Drawer, DRAWER_WIDTHS, DrawerProvider, DrawerController, AlertDialog };
