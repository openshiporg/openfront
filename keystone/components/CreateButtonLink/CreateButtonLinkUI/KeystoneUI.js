import { Button } from "@keystone-ui/button";
import Link from "next/link";

export const KeystoneUI = (props) => {
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
      Create {props.list.singular}
    </Button>
  );
};
