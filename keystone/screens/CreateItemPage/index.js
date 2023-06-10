import { models } from "@keystone/models";
import { getNamesFromList } from "@keystone/utils/getNamesFromList";
import { CreateItemPageUI } from "./CreateItemPageUI";

export const CreateItemPage = ({ params }) => {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const CreateItemPageTemplate = CreateItemPageUI[appTheme];

  const listKey = params.listKey;
  const listsObject = {};
  for (const [key, list] of Object.entries(models)) {
    const { adminUILabels } = getNamesFromList(key, list);
    listsObject[adminUILabels.path] = key;
  }
  const key = listsObject[listKey];

  return <CreateItemPageTemplate listKey={key} />;
};

