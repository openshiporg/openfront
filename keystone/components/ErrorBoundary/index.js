import { ErrorBoundaryUI } from "./ErrorBoundaryUI";

export const ErrorBoundary = ({ children }) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const ErrorBoundaryTemplate = ErrorBoundaryUI[appTheme];

  return <ErrorBoundaryTemplate children={children} />;
};
