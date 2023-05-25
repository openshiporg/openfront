import { CardsUI } from "./CardsUI";

export const Cards = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const CardsTemplate = CardsUI[appTheme];

  return <CardsTemplate {...props} />;
};
