import dynamic from "next/dynamic";
import { Tamagui } from "./Tamagui";
import { KeystoneUI } from "./KeystoneUI";

// decide to use dynamic or just JSON

// const Tamagui = dynamic(async () => (await import("./Tamagui")).Tamagui);
// const KeystoneUI = dynamic(
//   async () => (await import("./KeystoneUI")).KeystoneUI
// );

export const UIProviders = {
  Tamagui,
  KeystoneUI,
};



