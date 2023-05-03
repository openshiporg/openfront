import { useFormContext } from "react-hook-form";

/**
 * Utility component for nested forms.
 */
const ConnectForm = ({ children }) => {
  const methods = useFormContext();

  return children({ ...methods });
};

export default ConnectForm;
