import { useEffect } from "react";
import { getSigninPage } from "@keystone-6/auth/pages/SigninPage";
import { checkAuth } from "@lib/checkAuth";
import { useRouter } from "next/router";

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { authenticatedItem, redirectToInit } = await checkAuth();
      if (redirectToInit) {
        router.push("/admin/init");
      } else if (authenticatedItem) {
        router.push("/admin");
      }
    };
    fetchData();
  }, []);

  return getSigninPage({
    identityField: "email",
    secretField: "password",
    mutationName: "authenticateUserWithPassword",
    successTypename: "UserAuthenticationWithPasswordSuccess",
    failureTypename: "UserAuthenticationWithPasswordFailure",
  })();
};

export default Page;
