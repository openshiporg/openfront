import { FilterAddUI } from "./FilterAddUI";

export const FilterAdd = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const FilterAddTemplate = FilterAddUI[appTheme];

  return <FilterAddTemplate {...props} />;
};
