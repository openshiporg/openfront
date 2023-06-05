import { ToastUI } from "./ToastUI";

const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";

const { ToastProvider, useToasts } = ToastUI[appTheme];

export { ToastProvider, useToasts };
