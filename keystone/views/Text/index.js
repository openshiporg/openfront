import { TextUI } from "./TextUI";

const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
export const Text = TextUI[appTheme];
