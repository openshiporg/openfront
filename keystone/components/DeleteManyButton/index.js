import { DeleteManyButtonUI } from "./DeleteManyButtonUI";

export const DeleteManyButton = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const DeleteManyButtonTemplate = DeleteManyButtonUI[appTheme];

  return <DeleteManyButtonTemplate {...props} />;
};
