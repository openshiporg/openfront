import { checkAuth } from "@lib/checkAuth";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

// Custom hook to check authentication and handle redirection
export const useAuthRedirect = () => {
  const router = useRouter();
  const [authenticatedItem, setAuthenticatedItem] = useState(null);
  const [redirectTo, setRedirectTo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { authenticatedItem, redirectToInit } = await checkAuth(router);

      if (authenticatedItem) {
        setAuthenticatedItem(authenticatedItem);
        setIsLoading(false);
      }
      if (redirectToInit) {
        setRedirectTo("/admin/init");
        setIsLoading(false);
      }
      if (!redirectTo && !authenticatedItem) {
        setRedirectTo("/admin/signin");
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (redirectTo) {
      router.push(redirectTo);
    }
  }, [redirectTo]);

  return [authenticatedItem, isLoading];
};
