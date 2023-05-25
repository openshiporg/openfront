import { LoadingIconUI } from "./LoadingIconUI";

export const LoadingIcon = ({ label, size }) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const LoadingIconTemplate = LoadingIconUI[appTheme];

  return <LoadingIconTemplate label={label} size={size} />;
};
