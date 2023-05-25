import { RelationshipUI } from "./RelationshipUI";

const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
export const Relationship = RelationshipUI[appTheme];
