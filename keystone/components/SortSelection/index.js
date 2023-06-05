import { SortSelectionUI } from "./SortSelectionUI";

export const SortSelection = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const SortSelectionTemplate = SortSelectionUI[appTheme];

  return <SortSelectionTemplate {...props} />;
};
