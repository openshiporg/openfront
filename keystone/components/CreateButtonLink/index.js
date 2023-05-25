import { CreateButtonLinkUI } from "./CreateButtonLinkUI";

export const CreateButtonLink = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const CreateButtonTemplate = CreateButtonLinkUI[appTheme];

  return <CreateButtonTemplate {...props} />;
};
