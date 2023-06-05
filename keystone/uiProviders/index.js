import dynamic from "next/dynamic";
import { Tailwind } from "./Tailwind";
import { KeystoneUI } from "./KeystoneUI";

// decide to use dynamic or just JSON

// const Tailwind = dynamic(async () => (await import("./Tailwind")).Tailwind);
// const KeystoneUI = dynamic(
//   async () => (await import("./KeystoneUI")).KeystoneUI
// );

export const UIProviders = {
  Tailwind,
  KeystoneUI,
};



