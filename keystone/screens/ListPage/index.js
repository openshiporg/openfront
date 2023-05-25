import { ListPageUI } from "./ListPageUI";

export const ListPage = ({ sessionsEnabled }) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const ListPageTemplate = ListPageUI[appTheme];

  return <ListPageTemplate sessionsEnabled={sessionsEnabled} />;
};
