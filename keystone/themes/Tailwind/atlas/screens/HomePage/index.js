import { useMemo } from "react";

import { makeDataGetter } from "@keystone-6/core/admin-ui/utils";
import { gql, useQuery, useMutation } from "@keystone-6/core/admin-ui/apollo";
import { useKeystone, useList } from "@keystone/keystoneProvider";
import { Check, PlusIcon, Terminal } from "lucide-react";
import { Skeleton } from "../../primitives/default/ui/skeleton";
import { LoadingIcon } from "../../components/LoadingIcon";
import { AdminLink } from "../../components/AdminLink";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../primitives/default/ui/alert";
import { Button } from "../../primitives/default/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../primitives/default/ui/card";
import { cn } from "@keystone/utils/cn";

const SEED_STOREFRONT = gql`
  mutation {
    seedStorefront
  }
`;

const ListCard = ({ listKey, count, hideCreate }) => {
  const list = useList(listKey);
  return (
    <div className="shadow-xs flex items-center justify-between rounded-lg bg-zinc-50 border py-2 pl-3 pr-2 dark:border-white/5 dark:bg-black">
      <div className="w-full self-end">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          {list.isSingleton ? null : count.type === "success" ? (
            count.count
          ) : count.type === "error" ? (
            count.message
          ) : count.type === "loading" ? (
            <Skeleton className="h-3 w-16" />
          ) : (
            "No access"
          )}
        </div>
        <AdminLink
          className="font-medium text-zinc-700 dark:text-[#D9D9D9] dark:group-hover:text-white"
          href={`/${list.path}${list.isSingleton ? "/1" : ""}`}
        >
          {list.label}
        </AdminLink>
      </div>
      {/* {hideCreate === false && !list.isSingleton && (
        <AdminLink
          className="ml-auto my-auto"
          href={`/${list.path}${list.isSingleton ? "/1" : ""}/create`}
        >
          <Button variant="plain" size="icon">
            <PlusIcon />
          </Button>
        </AdminLink>
      )} */}
      {/* <button className="py-2 px-2.5 mr-1 rounded-lg flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#ED8424] via-[#E37712] to-[#D96900] font-sans font-medium text-white transition-shadow ease-in-out disabled:opacity-70 dark:bg-gradient-to-b dark:from-[#00D9A2] dark:via-[#00B487] dark:to-[#00916D] dark:text-white">
        <PlusIcon size={32} />
      </button> */}
      {/* <button className="py-2 px-2.5 mr-1 rounded-lg flex items-center justify-center overflow-hidden bg-gradient-to-b from-zinc-600 via-zinc-700 to-zinc-800 font-sans font-medium text-white transition-shadow ease-in-out disabled:opacity-70 dark:bg-gradient-to-b dark:from-zinc-400 dark:via-zinc-500 dark:to-zinc-600 dark:text-white">
        <PlusIcon size={32} />
      </button> */}
      {/* <button className="py-2 px-2.5 mr-1 rounded-lg flex items-center justify-center overflow-hidden bg-gradient-to-b from-zinc-400 via-zinc-500 to-zinc-600 font-sans font-medium text-white transition-shadow ease-in-out hover:bg-gradient-to-b hover:from-zinc-500 hover:via-zinc-600 hover:to-zinc-700 disabled:opacity-70 dark:bg-gradient-to-b dark:from-zinc-600 dark:via-zinc-700 dark:to-zinc-800 dark:text-white dark:hover:bg-gradient-to-b dark:hover:from-zinc-700 dark:hover:via-zinc-800 dark:hover:to-zinc-900">
        <PlusIcon size={32} />
      </button> */}
      {hideCreate === false && !list.isSingleton && (
        <AdminLink href={`/${list.path}${list.isSingleton ? "/1" : ""}/create`}>
          <button className="border p-2 rounded-lg flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-zinc-50 font-sans font-medium text-zinc-500 transition-shadow ease-in-out disabled:opacity-70 dark:bg-gradient-to-bl dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-400 hover:bg-gradient-to-b hover:from-zinc-50 hover:to-zinc-100 hover:text-zinc-700 dark:hover:bg-gradient-to-bl dark:hover:from-zinc-800 dark:hover:to-zinc-900 dark:hover:text-zinc-300">
            <PlusIcon size={28} />
          </button>
        </AdminLink>
      )}
    </div>
  );
};

export const HomePage = () => {
  const {
    adminMeta: { lists },
    visibleLists,
  } = useKeystone();

  const [seedStore, { loading: isSeeding }] = useMutation(SEED_STOREFRONT, {
    refetchQueries: "active"
  });

  const query = useMemo(
    () => gql`
  query {
    keystone {
      adminMeta {
        lists {
          key
          hideCreate
        }
      }
    }
    regionsCount
    ${Object.values(lists)
      .filter((list) => !list.isSingleton)
      .map((list) => `${list.key}: ${list.gqlNames.listQueryCountName}`)
      .join("\n")}
  }`,
    [lists]
  );
  let { data, error } = useQuery(query, { errorPolicy: "all" });

  const dataGetter = makeDataGetter(data, error?.graphQLErrors);

  const handleSeed = async () => {
    try {
      await seedStore();
    } catch (error) {
      console.error('Error seeding store:', error);
    }
  };

  return (
    <div>
      <div className="mt-2 mb-4 flex-col items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
        <p className="text-muted-foreground">
          {Object.keys(lists).length} Models
        </p>
      </div>
      
      {data?.regionsCount === 0 && (
        <Card className="flex mb-4 justify-between p-4 gap-8">
          <CardHeader className="p-0">
            <CardTitle className="text-lg">Your store is empty!</CardTitle>
            <CardDescription>
              Click confirm to create regions, countries, currencies, shipping options, payment providers, product categories, collections, and sample products.
            </CardDescription>
          </CardHeader>
          <div>
            <Button 
              onClick={handleSeed} 
              disabled={isSeeding}
              isLoading={isSeeding}
            >
              {!isSeeding && <Check className="mr-2 size-4" />}
              {isSeeding ? 'Creating...' : 'Confirm'}
            </Button>
          </div>
        </Card>
      )}

      {visibleLists.state === "loading" ? (
        // <LoadingIcon label="Loading lists" size="large" tone="passive" />
        null 
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 pb-12">
          {(() => {
            if (visibleLists.state === "error") {
              return (
                <span className="text-red-600 dark:text-red-500 text-sm">
                  {visibleLists.error instanceof Error
                    ? visibleLists.error.message
                    : visibleLists.error[0].message}
                </span>
              );
            }
            return Object.keys(lists).map((key) => {
              if (!visibleLists.lists.has(key)) {
                return null;
              }
              const result = dataGetter.get(key);
              return (
                <ListCard
                  count={
                    data
                      ? result.errors
                        ? { type: "error", message: result.errors[0].message }
                        : { type: "success", count: data[key] }
                      : { type: "loading" }
                  }
                  hideCreate={
                    data?.keystone.adminMeta.lists.find(
                      (list) => list.key === key
                    )?.hideCreate ?? false
                  }
                  key={key}
                  listKey={key}
                />
              );
            });
          })()}
        </div>
      )}
    </div>
  );
};
