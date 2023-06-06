import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { checkAuth } from "./checkAuth";

// Custom hook to check authentication and handle redirection
export const useAuthRedirect = () => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const authMiddleware = async () => {
      // const pathname = router.asPath;
      const { authenticatedItem, redirectToInit } = await checkAuth();

      // redirect to init if conditions are met
      if (pathname !== "/dashboard/init" && redirectToInit) {
        router.push("/dashboard/init");
      }

      // redirect to / if attempting to /init and conditions are not met
      else if (pathname === "/dashboard/init" && !redirectToInit) {
        router.push("/dashboard");
      }

      // don't redirect if we have access
      else if (authenticatedItem) {
      }

      // otherwise, redirect to signin
      else if (pathname === "/dashboard") {
        router.push("/dashboard/signin");
      } else {
        router.push(`/dashboard/signin?from=${encodeURIComponent(pathname)}`);
      }
    };

    authMiddleware();
  }, [pathname]);
};
