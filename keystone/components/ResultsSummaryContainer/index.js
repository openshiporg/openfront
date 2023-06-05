import { ResultsSummaryContainerUI } from "./ResultsSummaryContainerUI";

export const ResultsSummaryContainer = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const ResultsSummaryContainerTemplate = ResultsSummaryContainerUI[appTheme];

  return <ResultsSummaryContainerTemplate {...props} />;
};
