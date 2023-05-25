import { CreateItemDrawerUI } from "./CreateItemDrawerUI";

export const CreateItemDrawer = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const CreateItemDrawerTemplate = CreateItemDrawerUI[appTheme];

  return <CreateItemDrawerTemplate {...props} />;
};
