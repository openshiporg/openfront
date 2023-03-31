import { getListPage } from "@keystone-6/core/___internal-do-not-use-will-break-in-patch/admin-ui/pages/ListPage";
import { models } from "@models/index";
import { getNamesFromList } from "@lib/getNamesFromList";
import { checkAuth } from "@lib/checkAuth";
import { useRouter } from "next/router";
import { useAuthRedirect } from "@lib/useAuthRedirect";

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

  const listKey = router.query.listKey;
  const listsObject = {};
  for (const [key, list] of Object.entries(models)) {
    const { adminUILabels } = getNamesFromList(key, list);
    listsObject[adminUILabels.path] = key;
  }
  const key = listsObject[listKey];

  return getListPage({ listKey: key })();
};

export default Page;