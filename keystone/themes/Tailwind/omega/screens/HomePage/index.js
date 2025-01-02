import { getKeystoneMetadata } from "../../lib/keystoneMetadataQueries";
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
import { keystoneClient } from "@keystone/keystoneClient";

async function seedStore() {
  return keystoneClient.request({
    query: `
      mutation {
        seedStorefront
      }
    `,
  });
}

function ListCard({ list, count, hideCreate }) {
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
      {hideCreate === false && !list.isSingleton && (
        <AdminLink href={`/${list.path}${list.isSingleton ? "/1" : ""}/create`}>
          <button className="border p-2 rounded-lg flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-zinc-50 font-sans font-medium text-zinc-500 transition-shadow ease-in-out disabled:opacity-70 dark:bg-gradient-to-bl dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-400 hover:bg-gradient-to-b hover:from-zinc-50 hover:to-zinc-100 hover:text-zinc-700 dark:hover:bg-gradient-to-bl dark:hover:from-zinc-800 dark:hover:to-zinc-900 dark:hover:text-zinc-300">
            <PlusIcon size={28} />
          </button>
        </AdminLink>
      )}
    </div>
  );
}

export async function HomePage() {
  const { adminMeta: lists } = await getKeystoneMetadata();
  const regions = lists.Region;
  const showSeedCard = regions && regions.count === 0;

  return (
    <div>
      <div className="mt-2 mb-4 flex-col items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
        <p className="text-muted-foreground">
          {Object.keys(lists).length} Models
        </p>
      </div>

      {showSeedCard && (
        <Card className="flex mb-4 justify-between p-4 gap-8">
          <CardHeader className="p-0">
            <CardTitle className="text-lg">Your store is empty!</CardTitle>
            <CardDescription>
              Click confirm to create regions, countries, currencies, shipping
              options, payment providers, product categories, collections, and
              sample products.
            </CardDescription>
          </CardHeader>
          <div>
            <form action={seedStore}>
              <Button type="submit">
                <Check className="mr-2 size-4" />
                Confirm
              </Button>
            </form>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 pb-12">
        {Object.entries(lists).map(([key, list]) => (
          <ListCard
            key={key}
            list={list}
            count={{ type: "success", count: list.count }}
            hideCreate={list.hideCreate ?? false}
          />
        ))}
      </div>
    </div>
  );
}
