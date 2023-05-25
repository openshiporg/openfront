import { Label, styled } from "tamagui";

export const Tamagui = (props) => {
  if (props.children === null) {
    return null;
  }

  const FieldLabel = styled(Label, {
    fontSize: "$medium",
    fontWeight: "bold",
    height: "$3",
    marginLeft: "$1"
  });

  return <FieldLabel {...props} />;
};
