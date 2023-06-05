import { InlineEditUI } from "./InlineEditUI";

export const InlineEdit = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const InlineEditTemplate = InlineEditUI[appTheme];

  return <InlineEditTemplate {...props} />;
};
