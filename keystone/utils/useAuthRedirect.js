import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { checkAuth } from "./checkAuth";

// Custom hook to check authentication and handle redirection
export const useAuthRedirect = () => {
  const router = useRouter();
  const [authenticatedItem, setAuthenticatedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { authenticatedItem, redirectToInit } = await checkAuth(router);
      if (authenticatedItem) {
        setAuthenticatedItem(authenticatedItem);
        setIsLoading(false);
      }
      if (redirectToInit) {
        router.push("/dashboard/init");
        setIsLoading(false);
      }
      if (!redirectToInit && !authenticatedItem) {
        router.push("/dashboard/signin");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  return [authenticatedItem, isLoading];
};
