import { useEffect, useState } from "react";
import { getSigninPage } from "@keystone-6/auth/pages/SigninPage";
import { useAuthRedirect } from "@lib/useAuthRedirect";
import { useRouter } from "next/router";

const SigninPage = () => {
  const router = useRouter();
  // const [authenticatedItem, isLoading] = useAuthRedirect();

  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }
  // if (authenticatedItem) {
  //   router.push("/admin");
  //   return null;
  // }

  return getSigninPage({
    identityField: "email",
    secretField: "password",
    mutationName: "authenticateUserWithPassword",
    successTypename: "UserAuthenticationWithPasswordSuccess",
    failureTypename: "UserAuthenticationWithPasswordFailure",
  })();
};
export default SigninPage;
