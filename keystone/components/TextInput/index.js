import { TextInputUI } from "./TextInputUI";

export const TextInput = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const TextInputTemplate = TextInputUI[appTheme];

  return <TextInputTemplate {...props} />;
};
