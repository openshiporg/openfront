import { LogoUI } from "./LogoUI";

export const Logo = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const LogoTemplate = LogoUI[appTheme];

  return <LogoTemplate {...props} />;
};
