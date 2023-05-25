import { Text, styled } from "tamagui";

export const Tamagui = (props) => {
  if (props.children === null) {
    return null;
  }

  const FieldDescription = styled(Text, {
    fontSize: "$small",
    color: "$gray700",
    marginBottom: "$small",
  });
  
  return <FieldDescription {...props} />;
};
