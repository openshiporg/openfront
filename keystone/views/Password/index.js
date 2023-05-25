import { PasswordUI } from "./PasswordUI";

const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
export const Password = PasswordUI[appTheme];
