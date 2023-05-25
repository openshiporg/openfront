import { CheckboxUI } from "./CheckboxUI";

export const Checkbox = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const CheckboxTemplate = CheckboxUI[appTheme];

  return <CheckboxTemplate {...props} />;
};
