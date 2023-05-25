import { Input } from "tamagui";

export const Tamagui = (props) => {
  if (props.children === null) {
    return null;
  }

  return <Input width="100%" {...props} />;
};
