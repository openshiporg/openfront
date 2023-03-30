import { useState, useEffect } from "react";
import { getInitPage } from "@keystone-6/auth/pages/InitPage";
import { checkAuth } from "@lib/checkAuth";
import { useRouter } from "next/router";

const Page = () => {
  return getInitPage({
    listKey: "User",
    fieldPaths: ["name", "email", "password"],
  })();
};

const InitPage = () => {
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
    router.push("/admin");
    return null;
  }
  if (!redirectToInit) {
    router.push("/admin/signin");
    return null;
  }

  return <Page />;
};

export default InitPage;