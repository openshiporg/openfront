import { NoAccessUI } from "./NoAccessUI";

export const NoAccessPage = ({ sessionsEnabled }) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const NoAccessTemplate = NoAccessUI[appTheme];

  return <NoAccessTemplate sessionsEnabled={sessionsEnabled} />;
};
