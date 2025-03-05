import React from "react";
import { makeDataGetter } from "@keystone-6/core/admin-ui/utils";
import { OrderDetailsComponent } from "./OrderDetailsComponent";
import { CreateButtonLink } from "@keystone/themes/Tailwind/orion/components/CreateButtonLink";
import { Button } from "@ui/button";
import { Triangle, Circle, Square } from "lucide-react";
import { Skeleton } from "@ui/skeleton";
import { AdminLink } from "@keystone/themes/Tailwind/orion/components/AdminLink";
import Image from "next/image";

export const OrdersTable = ({
  data,
  error,
  listKey,
  list,
  handleOrderAction,
  channels,
  loadingActions,
  query,
  filters,
  searchParam,
  updateSearchString,
  push,
  showCreate,
}) => {
  if (!data) {
    return <Skeleton className="w-full h-20" />;
  }

  const dataGetter = makeDataGetter(data, error?.graphQLErrors);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data.items?.length) {
    return (
      <div className="h-full flex">
        <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/40 p-10 m-5 flex-1">
          <div className="text-center">
            <div className="relative h-11 w-11 mx-auto mb-2">
              <Triangle className="absolute left-1 top-1 w-4 h-4 fill-indigo-200 stroke-indigo-400 dark:stroke-indigo-600 dark:fill-indigo-950 rotate-[90deg]" />
              <Square className="absolute right-[.2rem] top-1 w-4 h-4 fill-orange-300 stroke-orange-500 dark:stroke-amber-600 dark:fill-amber-950 rotate-[30deg]" />
              <Circle className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 fill-emerald-200 stroke-emerald-400 dark:stroke-emerald-600 dark:fill-emerald-900" />
            </div>
            <p className="mt-2 text-sm font-medium">
              No <span className="lowercase">{list.label}</span>
            </p>
            {query.search || filters.filters.length ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Found matching your {searchParam ? 'search' : 'filters'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 mt-2"
                  onClick={() => {
                    updateSearchString("");
                    const path = window.location.pathname;
                    push(path);
                  }}
                >
                  Clear filters & search
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Get started by creating a new one.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 divide-y">
      {dataGetter.get("items").data.map((order) => (
        <OrderDetailsComponent
          key={order.id}
          order={{
            ...order,
            date: new Date(order.createdAt).toLocaleString(),
          }}
          shopId={order.shop?.id}
          onOrderAction={handleOrderAction}
          channels={channels}
          loadingActions={loadingActions}
          renderOrderId={() => (
            <AdminLink 
              href={`/platform/orders/${order.id}`}
              className="text-gray-900 dark:text-gray-50 hover:text-blue-600 dark:hover:text-blue-400"
            >
              #{order.displayId}
            </AdminLink>
          )}
          renderLineItem={(item) => (
            <div className="flex items-center gap-3">
              {item.thumbnail && (
                <div className="relative h-10 w-10 overflow-hidden rounded-md border bg-gray-100">
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <div>{item.title}</div>
                <div className="text-sm text-gray-500">
                  {item.quantity}x @ {item.formattedUnitPrice} = {item.formattedTotal}
                </div>
              </div>
            </div>
          )}
        />
      ))}
    </div>
  );
}; 