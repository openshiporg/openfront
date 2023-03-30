import { getItemPage } from "@keystone-6/core/___internal-do-not-use-will-break-in-patch/admin-ui/pages/ItemPage";
import { models } from "@models/index";
import { getNamesFromList } from "@lib/getNamesFromList";
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

  const listsObject = {};
  for (const [key, list] of Object.entries(models)) {
    const { adminUILabels } = getNamesFromList(key, list);
    listsObject[adminUILabels.path] = key;
  }

  const listKey = listsObject[router.query.listKey];

  return getItemPage({ listKey })();
};

export default Page;
