import { forwardRefWithAs } from "@keystone/utils/forwardRefWithAs";
import { Stack, styled } from "tamagui";

const FieldContainer = styled(Stack, {
  marginBottom: "$4",
  display: "flex",
  flexDirection: "column",
});

export const Tamagui = forwardRefWithAs(
  ({ as: Tag = "div", ...props }, ref) => {
    return <FieldContainer as={Tag} ref={ref} {...props} />;
  }
);