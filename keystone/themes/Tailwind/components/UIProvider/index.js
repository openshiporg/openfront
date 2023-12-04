import "./dashboard.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "./themeProvider";

const inter = Inter({ subsets: ["latin"] });

export const UIProvider = ({ children }) => {
  return (
    <body className={inter.className}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </body>
  );
};
