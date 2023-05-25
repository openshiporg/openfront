import { TextInput } from "@keystone-ui/fields";

export const KeystoneUI = (props) => {
  if (props.children === null) {
    return null;
  }

  return <TextInput {...props} />;
};
