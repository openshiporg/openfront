import Link from "next/link";

/**
 * This is the component you should use when linking a Cell to an item (i.e when the Cell supports
 * the linkTo prop)
 */

export const Tamagui = (props) => {
  return (
    <Link
      css={{
        display: "block",
        padding: 2,
        textDecoration: "none",

        ":hover": {
          textDecoration: "underline",
        },
      }}
      {...props}
    />
  );
};
