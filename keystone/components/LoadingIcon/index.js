import { LoadingIconUI } from "./LoadingIconUI";

export const LoadingIcon = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const LoadingIconTemplate = LoadingIconUI[appTheme];

  return <LoadingIconTemplate {...props} />;
};

// import { LoadingIconUI } from "./LoadingIconUI";

// const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";

// export const LoadingIconTemplate = LoadingIconUI[appTheme];
