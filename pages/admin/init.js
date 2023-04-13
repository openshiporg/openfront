import { getInitPage } from "@keystone-6/auth/pages/InitPage";
import { useRouter } from "next/router";
import { useAuthRedirect } from "@lib/useAuthRedirect";

const InitPage = () => {
  const router = useRouter();
  const [authenticatedItem, isLoading] = useAuthRedirect();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (authenticatedItem) {
    router.push("/admin");
    return null;
  }

  return getInitPage({
    listKey: "User",
    fieldPaths: ["name", "email", "password"],
  })();
};
export default InitPage;