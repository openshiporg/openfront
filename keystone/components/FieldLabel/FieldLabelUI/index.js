import dynamic from "next/dynamic";

const Tamagui = dynamic(async () => (await import("./Tamagui")).Tamagui);
const KeystoneUI = dynamic(
  async () => (await import("./KeystoneUI")).KeystoneUI
);

export const FieldLabelUI = {
  Tamagui,
  KeystoneUI,
};
