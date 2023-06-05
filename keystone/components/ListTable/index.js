import { ListTableUI } from "./ListTableUI";

export const ListTable = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const ListTableTemplate = ListTableUI[appTheme];

  return <ListTableTemplate {...props} />;
};
