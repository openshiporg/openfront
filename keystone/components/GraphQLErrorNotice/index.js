import { GraphQLErrorNoticeUI } from "./GraphQLErrorNoticeUI";

export const GraphQLErrorNotice = ({ children }) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const GraphQLErrorNoticeTemplate = GraphQLErrorNoticeUI[appTheme];

  return <GraphQLErrorNoticeTemplate children={children} />;
};
