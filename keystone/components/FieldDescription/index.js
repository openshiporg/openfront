import { FieldDescriptionUI } from "./FieldDescriptionUI";

export const FieldDescription = ({ children }) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const FieldDescriptionTemplate = FieldDescriptionUI[appTheme];

  return <FieldDescriptionTemplate children={children} />;
};
