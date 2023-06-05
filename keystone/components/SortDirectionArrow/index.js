import { SortDirectionArrowUI } from "./SortDirectionArrowUI";

export const SortDirectionArrow = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const SortDirectionArrowTemplate = SortDirectionArrowUI[appTheme];

  return <SortDirectionArrowTemplate {...props} />;
};
