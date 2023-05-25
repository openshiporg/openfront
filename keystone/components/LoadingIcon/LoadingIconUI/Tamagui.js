import { Spinner } from "tamagui";

export function Tamagui({ label, size }) {
  return (
    <Spinner
      size="large"
      color="$green10"
      minHeight={"100vh"}
      justifyContent="center"
    />
  );
}
