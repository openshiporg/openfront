import { Fragment, forwardRef } from "react";
import { VisuallyHidden } from "@keystone-ui/core";

import { ControlLabel } from "../ControlLabel";
import { CheckIcon, CheckboxIcon } from "@radix-ui/react-icons";
import { Checkbox as CB } from "../../primitives/default/ui/checkbox";

export const Checkbox = forwardRef(
  ({ children, className, size, ...props }, ref) => {
    return (
      <ControlLabel
        className={className}
        size={size}
        control={<CheckboxControl ref={ref} size={size} {...props} />}
      >
        {children}
      </ControlLabel>
    );
  }
);

export const CheckboxControl = forwardRef(
  ({ className, size, onChange, ...props }, ref) => (
    <Fragment>
      <VisuallyHidden ref={ref} as="input" type="checkbox" {...props} />
      <Indicator className={className} size={size}>
        <CB size={size} onCheckedChange={onChange} {...props} />
      </Indicator>
    </Fragment>
  )
);

const Indicator = ({ className, size, ...props }) => {
  return <div className={className} {...props} />;
};
