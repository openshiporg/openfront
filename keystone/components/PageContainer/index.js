import { PageContainerUI } from "./PageContainerUI";

export const PageContainer = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const PageContainerTemplate = PageContainerUI[appTheme];

  return <PageContainerTemplate {...props} />;
};
