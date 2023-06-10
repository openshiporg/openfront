import { PaginationUI } from "./PaginationUI";

const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";

const { Pagination, PaginationLabel } =
  PaginationUI[appTheme];

export { Pagination, PaginationLabel };
