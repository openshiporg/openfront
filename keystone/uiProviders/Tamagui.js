"use client";

import "@tamagui/core/reset.css";
import "@tamagui/polyfill-dev";
import { useState } from "react";
import { Button, TooltipSimple, useIsomorphicLayoutEffect } from "tamagui";
import { Monitor, Moon, Sun } from "@tamagui/lucide-icons";

// import { config as configBase } from "@tamagui/config"
import {
  NextThemeProvider,
  useRootTheme,
  useThemeSetting,
} from "@tamagui/next-theme";
// import { Main } from "next/document"
import { useServerInsertedHTML } from "next/navigation";
import React from "react";
import { TamaguiProvider as TamaguiProviderOG } from "@tamagui/core";
// import { AppRegistry } from "react-native"
// import { createTamagui, TamaguiProvider as TamaguiProviderOG } from "tamagui"

import { config as configBase } from "../../tamagui.config.js";

export const Tamagui = ({ children }) => {
  const [theme, setTheme] = useRootTheme();

  //   AppRegistry.registerComponent("Main", () => Main)
  // @ts-ignore
  //   const { getStyleElement } = AppRegistry.getApplication("Main")

  //   useServerInsertedHTML(() => getStyleElement())
  // useServerInsertedHTML(() => (
  //   <style dangerouslySetInnerHTML={{ __html: configBase.getCSS() }} />
  // ));

  return (
    <NextThemeProvider
      onChangeTheme={(next) => {
        setTheme(next);
      }}
    >
      <TamaguiProviderOG
        config={configBase}
        disableRootThemeClass
        defaultTheme={theme}
      >
        {/* <ThemeToggle /> */}
        {children}
      </TamaguiProviderOG>
    </NextThemeProvider>
  );
};
// "use client";
// import { useServerInsertedHTML } from "next/navigation";

// import React, { useState } from "react";
// import  { config as configBase } from "../../../tamagui.config.js";

// export function Tamagui({ children }) {
//   useServerInsertedHTML(() => {
//     // this first time this runs you'll get the full CSS including all themes

//     // after that, it will only return CSS generated since the last call

//     return <>{configBase.getNewCSS()}</>;
//   });
//   return children;
// }

const icons = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

export const ThemeToggle = (props) => {
  const themeSetting = useThemeSetting();
  const [clientTheme, setClientTheme] = useState("light");

  useIsomorphicLayoutEffect(() => {
    setClientTheme(themeSetting.current || "light");
  }, [themeSetting.current]);

  const Icon = icons[clientTheme];

  return (
    <TooltipSimple
      groupId="header-actions-theme"
      label={`Switch theme (${themeSetting.current})`}
    >
      <Button
        size="$3"
        onPress={themeSetting.toggle}
        {...props}
        aria-label="Toggle light/dark color scheme"
        icon={Icon}
      >
        {/* {theme === 'light' ? <Moon size={12} /> : <SunIcon />} */}
      </Button>
    </TooltipSimple>
  );
};
