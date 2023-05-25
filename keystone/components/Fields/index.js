import { FieldsUI } from "./FieldsUI";

export const Fields = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const FieldsTemplate = FieldsUI[appTheme];

  return <FieldsTemplate {...props} />;
};
