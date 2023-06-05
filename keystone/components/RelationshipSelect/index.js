import { RelationshipSelectUI } from "./RelationshipSelectUI";

export const RelationshipSelect = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const RelationshipSelectTemplate = RelationshipSelectUI[appTheme];

  return <RelationshipSelectTemplate {...props} />;
};
