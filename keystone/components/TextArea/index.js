import { TextAreaUI } from "./TextAreaUI";

export const TextArea = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const TextAreaTemplate = TextAreaUI[appTheme];

  return <TextAreaTemplate {...props} />;
};
