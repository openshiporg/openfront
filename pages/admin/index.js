import { HomePage } from "@keystone-6/core/___internal-do-not-use-will-break-in-patch/admin-ui/pages/HomePage";
import { useAuthRedirect } from "@lib/useAuthRedirect";
import { useRouter } from "next/router";

const Page = () => {
  const router = useRouter();
  const [authenticatedItem, isLoading] = useAuthRedirect();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!authenticatedItem) {
    router.push("/admin/signin");
    return null;
  }

  return <HomePage />;
};

export default Page;