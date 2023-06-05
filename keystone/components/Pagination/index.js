import { PaginationUI } from "./PaginationUI";

export const Pagination = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const PaginationTemplate = PaginationUI[appTheme];

  return <PaginationTemplate {...props} />;
};
