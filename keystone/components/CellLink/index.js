import { CellLinkUI } from "./CellLinkUI";

export const CellLink = ({ children, ...props }) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const CellLinkTemplate = CellLinkUI[appTheme];

  return <CellLinkTemplate children={children} {...props} />;
};
