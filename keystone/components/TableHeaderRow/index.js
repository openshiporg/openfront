import { TableHeaderRowUI } from "./TableHeaderRowUI";

export const TableHeaderRow = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const TableHeaderRowTemplate = TableHeaderRowUI[appTheme];

  return <TableHeaderRowTemplate {...props} />;
};
