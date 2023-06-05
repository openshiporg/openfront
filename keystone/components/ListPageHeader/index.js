import { ListPageHeaderUI } from "./ListPageHeaderUI";

export const ListPageHeader = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const ListPageHeaderTemplate = ListPageHeaderUI[appTheme];

  return <ListPageHeaderTemplate {...props} />;
};
