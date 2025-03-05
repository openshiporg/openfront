import React from "react";
import { makeDataGetter } from "@keystone-6/core/admin-ui/utils";
import { Button } from "@ui/button";
import {
  Triangle,
  Circle,
  Square,
  Info,
  Check,
  AlertCircle,
  XCircle,
  CheckCircle2,
  ChevronDown,
  MoreVertical,
} from "lucide-react";
import { Skeleton } from "@ui/skeleton";
import { AdminLink } from "@keystone/themes/Tailwind/orion/components/AdminLink";
import Image from "next/image";
import { Badge } from "@ui/badge";
import { ScrollArea } from "@ui/scroll-area";
import { Separator } from "@ui/separator";
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
import { PenSquare, Trash2 } from "lucide-react";
import { DeleteButton } from "@keystone/themes/Tailwind/orion/components/EditItemDrawer";
import { useDrawer } from "@keystone/themes/Tailwind/orion/components/Modals/drawer-context";
import { cn } from "@keystone/utils/cn";
import { CreateButtonLink } from "@keystone/themes/Tailwind/orion/components/CreateButtonLink";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@ui/accordion";

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
                  Found matching your {searchParam ? "search" : "filters"}
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
  };

  const statusIcons = {
    draft: <AlertCircle className="h-3.5 w-3.5 text-zinc-400" />,
    proposed: <Circle className="h-3.5 w-3.5 text-blue-500" />,
    published: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
    rejected: <XCircle className="h-3.5 w-3.5 text-red-500" />,
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      {dataGetter.get("items").data.map((product) => (
        <AccordionItem key={product.id} value={product.id} className="border-0">
          <div className="px-4 py-2 flex justify-between w-full border-b dark:border-zinc-800">
            <div className="flex items-center gap-3">
              {product.thumbnail ? (
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-gray-100">
                  <Image
                    src={product.thumbnail || "/images/placeholder.svg"}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border bg-muted">
                  <div className="h-6 w-6 text-muted-foreground/50" />
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <div className="flex flex-col items-baseline gap-1">
                  <AdminLink
                    href={`/platform/products/${product.id}`}
                    className="font-medium hover:underline text-xs sm:text-sm"
                  >
                    {product.title}
                  </AdminLink>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    <Badge
                      className={cn(
                        "py-0 text-[10px] sm:text-[11px] border uppercase font-medium tracking-wide rounded-full"
                      )}
                      color={
                        {
                          draft: "zinc",
                          proposed: "blue",
                          published: "emerald",
                          rejected: "red",
                        }[product.status]
                      }
                    >
                      {product.status}
                    </Badge>
                    <span className="truncate max-w-[120px] sm:max-w-none">
                      {product.handle}
                    </span>
                    <span>•</span>
                    <span>
                      {product.productVariants?.length || 0} variant
                      {product.productVariants?.length > 1 && "s"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="icon"
                className="border [&_svg]:size-3 h-6 w-6"
                onClick={() => openEditDrawer(product.id, "Product")}
              >
                <MoreVertical className="stroke-muted-foreground" />
              </Button>
              <AccordionTrigger hideArrow className="py-0">
                <Button
                  variant="secondary"
                  size="icon"
                  className="border [&_svg]:size-3 h-6 w-6"
                >
                  <ChevronDown />
                </Button>
              </AccordionTrigger>
            </div>
          </div>
          <AccordionContent className="border-b">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 p-4 max-w-4xl">
              {/* Variants */}
              <div className="border-b md:border-b-0 md:border-r dark:border-zinc-800 pb-6 md:pb-0 md:pr-6">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-50">
                    Product Variants
                  </h4>
                  <span className="font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-50">
                    Stock
                  </span>
                </div>
                <ScrollArea className="max-h-[200px]">
                  <div className="space-y-1">
                    {product.productVariants?.map((variant) => (
                      <div
                        key={variant.id}
                        className="flex items-center justify-between py-2 text-[10px] sm:text-sm text-muted-foreground border-b last:border-b-0 dark:border-zinc-800"
                      >
                        <span className="truncate mr-2">
                          {variant.title}
                          {variant.sku && (
                            <span className="ml-2 text-[9px] sm:text-xs">
                              (SKU: {variant.sku})
                            </span>
                          )}
                        </span>
                        <span className="shrink-0">
                          {variant.inventoryQuantity || 0} in stock
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Product Details */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-50">
                    Product Details
                  </h4>
                  <span className="font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-50">
                    Value
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between py-2 border-b dark:border-zinc-800">
                    <span className="text-[10px] sm:text-sm text-muted-foreground">
                      Handle
                    </span>
                    <span className="text-[10px] sm:text-sm text-muted-foreground truncate ml-2 text-right">
                      {product.handle}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b dark:border-zinc-800">
                    <span className="text-[10px] sm:text-sm text-muted-foreground">
                      Created
                    </span>
                    <span className="text-[10px] sm:text-sm text-muted-foreground">
                      {formatDate(product.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b last:border-b-0 dark:border-zinc-800">
                    <span className="text-[10px] sm:text-sm text-muted-foreground">
                      Collections
                    </span>
                    <span className="text-[10px] sm:text-sm text-muted-foreground">
                      {product.productCollections?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
