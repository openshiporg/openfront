import { Button } from "tamagui";

export function Tamagui({ loading, endSession, children }) {
  return (
    <Button
      theme="red"
      marginTop="$4"
      isLoading={loading}
      onClick={() => endSession()}
    >
      {children || "Sign out"}
    </Button>
  );
}
