// import { models } from "@keystone/models";
// import { getNamesFromList } from "@keystone/utils/getNamesFromList";
// import { getListPageData, getListTableData } from "../../data/lists";
// import { ListPageClient } from "./client";

// export async function ListPage({ params, searchParams }) {
//   const listKey = params.listKey;
//   const listsObject = {};
//   for (const [key, list] of Object.entries(models)) {
//     const { adminUILabels } = getNamesFromList(key, list);
//     listsObject[adminUILabels.path] = key;
//   }
//   const key = listsObject[listKey];

//   const currentPage = Number(searchParams.page) || 1;
//   const pageSize = Number(searchParams.pageSize) || 50;
//   const search = searchParams.search || "";

//   const [{ list, metaData, items, count }, listTableData] = await Promise.all([
//     getListPageData(key, {
//       currentPage,
//       pageSize,
//       search,
//     }),
//     getListTableData(key),
//   ]);


//   return (
//     <div>{JSON.stringify({ list, items, count, listTableData })}</div>

//     // <ListPageClient
//     //   listKey={key}
//     //   list={list}
//     //   metaData={metaData}
//     //   items={items}
//     //   count={count}
//     //   currentPage={currentPage}
//     //   pageSize={pageSize}
//     //   listTableData={listTableData}
//     // />
//   );
// }

import { models } from "@keystone/models";
import { getNamesFromList } from "@keystone/utils/getNamesFromList";
import { getAllListPageData } from "../../data/lists";
import { ListPageClient } from "./client";

export async function ListPage({ params, searchParams }) {
  const listKey = params.listKey;
  const listsObject = {};
  for (const [key, list] of Object.entries(models)) {
    const { adminUILabels } = getNamesFromList(key, list);
    listsObject[adminUILabels.path] = key;
  }
  const key = listsObject[listKey];

  const currentPage = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.pageSize) || 50;

  // Get all list data in one query with search params
  const { list, items, count, metaData, listTableData } = await getAllListPageData(key, {
    currentPage,
    pageSize,
    searchParams,
  });

  return (
    // <div>{JSON.stringify({ list, items, count, listTableData })}</div>
    <ListPageClient
      listKey={key}
      list={list}
      metaData={metaData}
      items={items}
      count={count}
      currentPage={currentPage}
      pageSize={pageSize}
      listTableData={listTableData}
    />
  );
}
