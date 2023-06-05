import { FieldSelectionUI } from "./FieldSelectionUI";

export const FieldSelection = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const FieldSelectionTemplate = FieldSelectionUI[appTheme];

  return <FieldSelectionTemplate {...props} />;
};
