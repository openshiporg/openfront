import { CellContainerUI } from "./CellContainerUI";

export const CellContainer = ({ children, ...props }) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const CellContainerTemplate = CellContainerUI[appTheme];

  return <CellContainerTemplate children={children} {...props} />;
};
