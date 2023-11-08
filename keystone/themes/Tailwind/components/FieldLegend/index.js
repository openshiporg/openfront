import { useTheme } from "@keystone-ui/core";

export const FieldLegend = (props) => {
  const { typography, fields, spacing } = useTheme();
  return (
    <legend
      className="text-blue-600 block text-sm font-bold mb-1 uppercase"
      style={{ minWidth: "120px" }}
      {...props}
    />
  );
};
