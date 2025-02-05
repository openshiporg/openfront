import React from "react";
import { makeDataGetter } from "@keystone-6/core/admin-ui/utils";
import { Button } from "@ui/button";
import { Triangle, Circle, Square, Info } from "lucide-react";
import { Skeleton } from "@ui/skeleton";
import { AdminLink } from "@keystone/themes/Tailwind/orion/components/AdminLink";
import Image from "next/image";
import { Badge } from "@ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@ui/tooltip";
import { MoreHorizontal, PenSquare, Trash2 } from "lucide-react";
import { DeleteButton } from "@keystone/themes/Tailwind/orion/components/EditItemDrawer";
import { useDrawer } from "@keystone/themes/Tailwind/orion/components/Modals/drawer-context";
import { cn } from "@keystone/utils/cn";

export const ProductsTable = ({
  data,
  error,
  listKey,
  list,
  handleProductAction,
  loadingActions,
  query,
  filters,
  searchParam,
  updateSearchString,
  push,
  showCreate,
}) => {
  const { openEditDrawer } = useDrawer();

  if (!data) {
    return <Skeleton className="w-full h-20" />;
  }

  const dataGetter = makeDataGetter(data, error?.graphQLErrors);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data.items?.length) {
    return (
      <div>
        <div className="flex flex-col items-center p-10 border-dashed border-2 rounded-lg m-5">
          <div className="flex opacity-40">
            <Triangle className="w-8 h-8 fill-indigo-200 stroke-indigo-400 dark:stroke-indigo-600 dark:fill-indigo-950" />
            <Circle className="w-8 h-8 fill-emerald-200 stroke-emerald-400 dark:stroke-emerald-600 dark:fill-emerald-950" />
            <Square className="w-8 h-8 fill-orange-300 stroke-orange-500 dark:stroke-amber-600 dark:fill-amber-950" />
          </div>
          {query.search || filters.filters.length ? (
            <>
              <span className="pt-4 font-semibold">
                No <span className="lowercase">{list.label}</span>{" "}
              </span>
              <span className="text-muted-foreground pb-4">
                Found {searchParam ? `matching your search` : `matching your filters`}{" "}
              </span>
              <Button
                variant="secondary"
                onClick={() => {
                  updateSearchString("");
                  const path = window.location.pathname;
                  push(path);
                }}
              >
                Clear filters &amp; search
              </Button>
            </>
          ) : (
            <>
              <span className="pt-4 font-semibold">
                No <span className="lowercase">{list.label}</span>
              </span>
              <span className="text-muted-foreground pb-4">
                Get started by creating a new one.{" "}
              </span>
              {showCreate && <CreateButtonLink list={list} />}
            </>
          )}
        </div>
      </div>
    );
  }

  const statusColors = {
    draft: "bg-zinc-500/10 text-zinc-500/90 dark:bg-white/5 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700/50",
    proposed: "bg-blue-500/15 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-800/50",
    published: "bg-green-500/15 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-300 dark:border-green-900/50",
    rejected: "bg-red-500/15 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-900/50",
  };

  return (
    <div className="divide-y border rounded-lg">
      {dataGetter.get("items").data.map((product) => (
        <div
          key={product.id}
          className="group hover:bg-muted/40 transition-colors"
        >
          <div className="px-4 py-3 sm:py-4 flex flex-col sm:flex-row justify-between w-full">
            <div className="flex flex-col items-start text-left gap-2 sm:gap-1.5">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-3">
                  {product.productImages?.[0] ? (
                    <div className="relative h-12 w-12 overflow-hidden rounded-md border bg-gray-100">
                      <Image
                        src={product.productImages[0].image.url}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted">
                      <Square className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <AdminLink
                        href={`/platform/products/${product.id}`}
                        className="font-medium hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {product.title}
                      </AdminLink>
                      {product.handle && (
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="[&_svg]:size-3 w-5 h-5"
                              >
                                <Info/>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="px-2 py-1 text-xs">
                              Handle: {product.handle}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      <span className="font-medium">
                        {product.productVariants?.length || 0}
                      </span>{" "}
                      variant{product.productVariants?.length !== 1 && "s"}
                      {product.productVariants?.length > 0 && (
                        <span className="ml-1 text-xs">
                          (
                          {product.productVariants.reduce(
                            (total, variant) => total + (variant.inventoryQuantity || 0),
                            0
                          )}{" "}
                          in stock)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 mt-4 sm:mt-0">
              <Badge 
                className={cn(
                  "border text-[.65rem] py-0.5 px-1.5 font-medium", 
                  statusColors[product.status]
                )}
              >
                {product.status.toUpperCase()}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-5 w-5 [&_svg]:size-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => openEditDrawer(product.id, "Product")}
                    className="gap-2 font-medium tracking-wide"
                  >
                    <PenSquare className="h-4 w-4" />
                    EDIT PRODUCT
                  </DropdownMenuItem>
                  <DeleteButton
                    itemLabel={product.title}
                    itemId={product.id}
                    list={list}
                  >
                    <DropdownMenuItem className="gap-2 font-medium tracking-wide">
                      <Trash2 className="h-4 w-4" />
                      DELETE PRODUCT
                    </DropdownMenuItem>
                  </DeleteButton>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 