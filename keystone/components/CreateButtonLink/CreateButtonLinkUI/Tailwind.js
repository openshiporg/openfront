import Link from "next/link";

export function Tailwind(props) {
  return (
    <button
      as={Link}
      href={`/${props.list.path}/create`}
      tone="active"
      size="small"
      weight="bold"
    >
      Create {props.list.singular}
    </button>
  );
}
