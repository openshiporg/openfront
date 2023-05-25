import { FieldLabelUI } from "./FieldLabelUI";

export const FieldLabel = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const FieldLabelTemplate = FieldLabelUI[appTheme];

  return <FieldLabelTemplate {...props} />;
};
