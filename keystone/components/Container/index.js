import { ContainerUI } from "./ContainerUI";

export const Container = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const ContainerTemplate = ContainerUI[appTheme];

  return <ContainerTemplate {...props} />;
};
