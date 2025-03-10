import { useEffect, useMemo, useState } from "react";
import { useLazyQuery } from "@keystone-6/core/admin-ui/apollo";
import { getGqlNames } from "@keystone-6/core/types";
import { hashString } from "./hashString";
import { staticAdminMetaQuery } from "./staticAdminMetaQuery";

const expectedExports = new Set(['Field', 'controller']);

const adminMetaLocalStorageKey = "keystone.adminMeta";

let _mustRenderServerResult = true;

function useMustRenderServerResult() {
  let [, forceUpdate] = useState(0);
  useEffect(() => {
    _mustRenderServerResult = false;
    forceUpdate(1);
  }, []);

  if (typeof window === "undefined") {
    return true;
  }

  return _mustRenderServerResult;
}

export function useAdminMeta(adminMetaHash, fieldViews) {
  const adminMetaFromLocalStorage = useMemo(() => {
    if (typeof window === "undefined") {
      return;
    }
    const item = localStorage.getItem(adminMetaLocalStorageKey);
    if (item === null) {
      return;
    }
    try {
      let parsed = JSON.parse(item);
      if (parsed.hash === adminMetaHash) {
        return parsed.meta;
      }
    } catch (err) {
      return;
    }
  }, [adminMetaHash]);

  // it seems like Apollo doesn't skip the first fetch when using skip: true so we're using useLazyQuery instead
  const [fetchStaticAdminMeta, { data, error, called }] = useLazyQuery(
    staticAdminMetaQuery,
    {
      fetchPolicy: "network-only",
    }
  );

  const shouldFetchAdminMeta =
    adminMetaFromLocalStorage === undefined && !called;

  useEffect(() => {
    if (shouldFetchAdminMeta) {
      fetchStaticAdminMeta();
    }
  }, [shouldFetchAdminMeta, fetchStaticAdminMeta]);

  const runtimeAdminMeta = useMemo(() => {
    if ((!data || error) && !adminMetaFromLocalStorage) {
      return undefined;
    }
    const adminMeta = adminMetaFromLocalStorage
      ? adminMetaFromLocalStorage
      : data.keystone.adminMeta;
    const runtimeAdminMeta = {
      lists: {},
    };

    for (const list of adminMeta.lists) {
      runtimeAdminMeta.lists[list.key] = {
        ...list,
        groups: [],
        gqlNames: getGqlNames({
          listKey: list.key,
          pluralGraphQLName: list.listQueryName,
        }), // TODO: replace with an object
        fields: {},
      };

      for (const field of list.fields) {
        // expectedExports.forEach((exportName) => {
        //   if (fieldViews[field.viewsIndex][exportName] === undefined) {
        //     throw new Error(
        //       `The view for the field at ${list.key}.${field.path} is missing the ${exportName} export`
        //     );
        //   }
        // });
        // Object.keys(fieldViews[field.viewsIndex]).forEach((exportName) => {
        //   if (
        //     !expectedExports.has(exportName) &&
        //     exportName !== "allowedExportsOnCustomViews"
        //   ) {
        //     throw new Error(
        //       `Unexpected export named ${exportName} from the view from the field at ${list.key}.${field.path}`
        //     );
        //   }
        // });
        const views = { ...fieldViews[field.viewsIndex] };
        const customViews = {};
        if (field.customViewsIndex !== null) {
          const customViewsSource = fieldViews[field.customViewsIndex];
          const allowedExportsOnCustomViews = new Set(
            views.allowedExportsOnCustomViews
          );
          Object.keys(customViewsSource).forEach((exportName) => {
            if (allowedExportsOnCustomViews.has(exportName)) {
              customViews[exportName] = customViewsSource[exportName];
            } else if (expectedExports.has(exportName)) {
              views[exportName] = customViewsSource[exportName];
            } else {
              throw new Error(
                `Unexpected export named ${exportName} from the custom view from field at ${list.key}.${field.path}`
              );
            }
          });
        }

        runtimeAdminMeta.lists[list.key].fields[field.path] = {
          ...field,
          itemView: {
            fieldMode: field.itemView?.fieldMode ?? null,
            fieldPosition: field.itemView?.fieldPosition ?? null,
          },
          graphql: {
            isNonNull: field.isNonNull,
          },
          views,
          controller: views.controller({
            listKey: list.key,
            fieldMeta: field.fieldMeta,
            label: field.label,
            description: field.description,
            path: field.path,
            customViews,
          }),
        };
      }

      for (const group of list.groups) {
        runtimeAdminMeta.lists[list.key].groups.push({
          label: group.label,
          description: group.description,
          fields: group.fields.map(
            (field) => runtimeAdminMeta.lists[list.key].fields[field.path]
          ),
        });
      }
    }

    if (typeof window !== "undefined" && !adminMetaFromLocalStorage) {
      localStorage.setItem(
        adminMetaLocalStorageKey,
        JSON.stringify({
          hash: hashString(JSON.stringify(adminMeta)),
          meta: adminMeta,
        })
      );
    }

    return runtimeAdminMeta;
  }, [data, error, adminMetaFromLocalStorage, fieldViews]);

  const mustRenderServerResult = useMustRenderServerResult();

  if (mustRenderServerResult) {
    return { state: "loading" };
  }
  if (runtimeAdminMeta) {
    return { state: "loaded", value: runtimeAdminMeta };
  }
  if (error) {
    return {
      state: "error",
      error,
      refetch: async () => {
        await fetchStaticAdminMeta();
      },
    };
  }
  return { state: "loading" };
}
