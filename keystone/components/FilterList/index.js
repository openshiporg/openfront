import { FilterListUI } from "./FilterListUI";

export const FilterList = (props) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const FilterListTemplate = FilterListUI[appTheme];

  return <FilterListTemplate {...props} />;
};


// import dynamic from "next/dynamic";

// // This function takes a component name (like "FieldSelection"),
// // and returns a component that dynamically imports the appropriate
// // UI component based on the app theme.
// export function createUIComponent(componentName) {
//   // Get the app theme from the environment variables.
//   const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";

//   // Dynamically import the UI component for the current theme.
//   const UIComponent = dynamic(
//     async () => (await import(`./${componentName}/${appTheme}`))[appTheme]
//   );

//   // Return a component that renders the UI component with all props passed through.
//   return (props) => <UIComponent {...props} />;
// }

// export const FilterList = createUIComponent("FilterList");
