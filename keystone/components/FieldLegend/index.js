import { FieldLegendUI } from "./FieldLegendUI";

export const FieldLegend = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const FieldLegendTemplate = FieldLegendUI[appTheme];

  return <FieldLegendTemplate {...props} />;
};
