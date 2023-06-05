import { TableContainerUI } from "./TableContainerUI";

export const TableContainer = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const TableContainerTemplate = TableContainerUI[appTheme];

  return <TableContainerTemplate {...props} />;
};
