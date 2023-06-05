import dynamic from "next/dynamic";

const Tailwind = dynamic(async () => (await import("./Tailwind")).Tailwind);
const KeystoneUI = dynamic(
  async () => (await import("./KeystoneUI")).KeystoneUI
);

export const SortSelectionUI = {
  Tailwind,
  KeystoneUI,
};
