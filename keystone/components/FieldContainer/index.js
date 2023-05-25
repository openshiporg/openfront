import { FieldContainerUI } from "./FieldContainerUI";

export const FieldContainer = ({ children, ...props }) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const FieldContainerTemplate = FieldContainerUI[appTheme];

  return <FieldContainerTemplate children={children} {...props} />;
};
