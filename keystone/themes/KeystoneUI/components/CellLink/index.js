import { useTheme } from "@keystone-ui/core";
import Link from "next/link";

/**
 * This is the component you should use when linking a Cell to an item (i.e when the Cell supports
 * the linkTo prop)
 */

export const CellLink = (props) => {
  const { colors, spacing } = useTheme();
  return (
    <Link
      css={{
        color: colors.foreground,
        display: "block",
        padding: spacing.small,
        textDecoration: "none",

        ":hover": {
          textDecoration: "underline",
        },
      }}
      {...props}
    />
  );
};
