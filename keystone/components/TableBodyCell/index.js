import { TableBodyCellUI } from "./TableBodyCellUI";

export const TableBodyCell = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const TableBodyCellTemplate = TableBodyCellUI[appTheme];

  return <TableBodyCellTemplate {...props} />;
};
