import { useEffect } from "react";
import { gql, useMutation } from "@keystone-6/core/admin-ui/apollo";
import { SignoutButtonUI } from "./SignoutButtonUI";

const END_SESSION = gql`
  mutation EndSession {
    endSession
  }
`;

const SignoutButton = ({ children }) => {
  const [endSession, { loading, data }] = useMutation(END_SESSION);
  useEffect(() => {
    if (data?.endSession) {
      window.location.reload();
    }
  }, [data]);

  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const SignoutButtonTemplate = SignoutButtonUI[appTheme];

  return (
    <SignoutButtonTemplate
      loading={loading}
      endSession={endSession}
      children={children}
    />
  );
};
export { SignoutButton };
