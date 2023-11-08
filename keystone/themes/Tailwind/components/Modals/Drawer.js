import {
  makeId,
  useId,
  Heading,
  Stack,
  Divider,
} from "@keystone-ui/core";

import { DrawerBase } from "./DrawerBase";
import { useDrawerControllerContext } from "./DrawerController";
import { Button } from "../../primitives/default/ui/button";

export const Drawer = ({
  actions,
  children,
  title,
  id,
  initialFocusRef,
  width = "narrow",
}) => {
  const transitionState = useDrawerControllerContext();
  const { cancel, confirm } = actions;

  const safeClose = actions.confirm.loading ? () => {} : actions.cancel.action;

  const instanceId = useId(id);
  const headingId = makeId(instanceId, "heading");

  return (
    <DrawerBase
      transitionState={transitionState}
      aria-labelledby={headingId}
      initialFocusRef={initialFocusRef}
      onSubmit={actions.confirm.action}
      onClose={safeClose}
      width={width}
    >
      <div className="items-center border-b flex flex-shrink-0 h-20 py-6 px-8">
        <Heading id={headingId} type="h3">
          {title}
        </Heading>
      </div>

      <div className="overflow-y-auto px-8">{children}</div>

      <Divider marginX="xlarge" />
      <Stack padding="xlarge" across gap="small">
        <Button type="submit" isLoading={confirm.loading}>
          {confirm.label}
        </Button>
        <Button onClick={safeClose} disabled={confirm.loading} variant="ghost">
          {cancel.label}
        </Button>
      </Stack>
    </DrawerBase>
  );
};
