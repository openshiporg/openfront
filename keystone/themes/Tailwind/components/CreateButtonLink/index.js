/** @jsxRuntime classic */
/** @jsx jsx */

import { Button } from "@keystone-ui/button";
import { jsx } from "@keystone-ui/core";
import Link from "next/link";

export const CreateButtonLink = (props) => {
  return (
    <Button
      css={{
        textDecoration: "none",
        ":hover": {
          color: "white",
        },
      }}
      as={Link}
      href={`/${props.list.path}/create`}
      tone="active"
      size="small"
      weight="bold"
    >
      Create fuck {props.list.singular}
    </Button>
  );
};
