import { TableHeaderCellUI } from "./TableHeaderCellUI";

export const TableHeaderCell = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const TableHeaderCellTemplate = TableHeaderCellUI[appTheme];

  return <TableHeaderCellTemplate {...props} />;
};
