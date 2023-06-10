import { HomePageUI } from "./HomePageUI";

export const HomePage = ({ params }) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const HomePageTemplate = HomePageUI[appTheme];

  return <HomePageTemplate />;
};
