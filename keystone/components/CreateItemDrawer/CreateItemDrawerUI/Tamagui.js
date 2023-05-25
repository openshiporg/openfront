import { Button } from "tamagui";
import Link from "next/link";

export function Tamagui(props) {
  return (
    <Button
      as={Link}
      href={`/${props.list.path}/create`}
      tone="active"
      size="small"
      weight="bold"
    >
      Create {props.list.singular}
    </Button>
  );
}
