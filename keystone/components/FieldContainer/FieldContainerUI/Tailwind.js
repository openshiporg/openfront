import { forwardRefWithAs } from "@keystone/utils/forwardRefWithAs";

export const Tailwind = forwardRefWithAs(
  ({ as: Tag = "div", ...props }, ref) => {
    return <div as={Tag} ref={ref} {...props} />;
  }
);
