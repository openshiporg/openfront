import { getInitPage } from "@keystone-6/auth/pages/InitPage";
import { checkAuth } from "@lib/checkAuth";
import { useEffect } from "react";
import { useRouter } from "next/router";

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { authenticatedItem, redirectToInit } = await checkAuth();
      if (authenticatedItem) {
        router.push("/admin");
      } else if (!redirectToInit) {
        router.push("/admin/signin");
      }
    };
    fetchData();
  }, []);

  return getInitPage({
    listKey: "User",
    fieldPaths: ["name", "email", "password"],
  })();
};

export default Page;