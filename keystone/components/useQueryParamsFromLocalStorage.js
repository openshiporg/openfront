import { useEffect } from "react";
import { useRouter } from "../../../../admin-ui/router";
import { storeableQueries } from "./ListPage";

export function useQueryParamsFromLocalStorage(listKey) {
  const router = useRouter();
  const localStorageKey = `keystone.list.${listKey}.list.page.info`;

  const resetToDefaults = () => {
    localStorage.removeItem(localStorageKey);
    router.replace({ pathname: router.pathname });
  };

  // GET QUERY FROM CACHE IF CONDITIONS ARE RIGHT
  // MERGE QUERY PARAMS FROM CACHE WITH QUERY PARAMS FROM ROUTER
  useEffect(
    () => {
      let hasSomeQueryParamsWhichAreAboutListPage = Object.keys(
        router.query
      ).some(x => {
        return x.startsWith("!") || storeableQueries.includes(x);
      });

      if (!hasSomeQueryParamsWhichAreAboutListPage && router.isReady) {
        const queryParamsFromLocalStorage = localStorage.getItem(
          localStorageKey
        );
        let parsed;
        try {
          parsed = JSON.parse(queryParamsFromLocalStorage);
        } catch (err) { }
        if (parsed) {
          router.replace({ query: { ...router.query, ...parsed } });
        }
      }
    },
    [localStorageKey, router.isReady]
  );
  useEffect(() => {
    let queryParamsToSerialize = {};
    Object.keys(router.query).forEach(key => {
      if (key.startsWith("!") || storeableQueries.includes(key)) {
        queryParamsToSerialize[key] = router.query[key];
      }
    });
    if (Object.keys(queryParamsToSerialize).length) {
      localStorage.setItem(
        localStorageKey,
        JSON.stringify(queryParamsToSerialize)
      );
    } else {
      localStorage.removeItem(localStorageKey);
    }
  }, [localStorageKey, router]);

  return { resetToDefaults };
}
