import { InlineCreateUI } from "./InlineCreateUI";

export const InlineCreate = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const InlineCreateTemplate = InlineCreateUI[appTheme];

  return <InlineCreateTemplate {...props} />;
};
