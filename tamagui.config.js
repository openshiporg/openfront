import { createTamagui } from "tamagui";
import { createInterFont } from "@tamagui/font-inter";
import { shorthands } from "@tamagui/shorthands";
import { themes, tokens } from "@tamagui/themes";
import { createMedia } from "@tamagui/react-native-media-driver";
import { createAnimations } from "@tamagui/animations-react-native";
import fonts from './fonts';

export const config = createTamagui({
  defaultFont: "body",
  animations: createAnimations({
    bouncy: {
      type: "spring",
      damping: 10,
      mass: 0.9,
      stiffness: 100,
    },
    lazy: {
      type: "spring",
      damping: 20,
      stiffness: 60,
    },
    quick: {
      type: "spring",
      damping: 20,
      mass: 1.2,
      stiffness: 250,
    },
  }),
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  shorthands,
  fonts,
  themes,
  tokens,
  media: createMedia({
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: "none" },
    pointerCoarse: { pointer: "coarse" },
  }),
});
