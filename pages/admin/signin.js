import { useState, useEffect } from "react";
import { getSigninPage } from "@keystone-6/auth/pages/SigninPage";
import { checkAuth } from "@lib/checkAuth";
import { useRouter } from "next/router";

const SignInPage = () => {
  const [authenticatedItem, setAuthenticatedItem] = useState(null);
  const [redirectToInit, setRedirectToInit] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    const { authenticatedItem: authItem, redirectToInit: redirectTo } = await checkAuth();
    setAuthenticatedItem(authItem);
    setRedirectToInit(redirectTo);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (authenticatedItem) {
    router.push("/");
    return null;
  }

  if (redirectToInit) {
    router.push("/init");
    return null;
  }

  return getSigninPage({
    identityField: "email",
    secretField: "password",
    mutationName: "authenticateUserWithPassword",
    successTypename: "UserAuthenticationWithPasswordSuccess",
    failureTypename: "UserAuthenticationWithPasswordFailure",
  })();
};

export default SignInPage;