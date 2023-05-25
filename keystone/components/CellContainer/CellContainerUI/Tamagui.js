import { Stack } from "tamagui";

/**
 * This is the component you should use when you want the standard padding around a cell value
 */

export const Tamagui = ({ children, ...props }) => {
  return (
    <Stack padding="sm" {...props}>
      {children}
    </Stack>
  );
};
