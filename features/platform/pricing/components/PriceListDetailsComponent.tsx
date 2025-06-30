"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, BadgeDollarSign, Edit, Trash, Package } from "lucide-react";
import Link from "next/link";
import { EditItemDrawer } from "../../components/EditItemDrawer";
import { PriceList } from "../actions/price-list-actions";

interface PriceListDetailsComponentProps {
  priceList: PriceList;
  list: any;
}

export function PriceListDetailsComponent({ priceList, list }: PriceListDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  const now = new Date();
  const isScheduled = priceList.startsAt && new Date(priceList.startsAt) > now;
  const isExpired = priceList.endsAt && new Date(priceList.endsAt) < now;
  const isActive = priceList.status === 'active' && !isScheduled && !isExpired;

  const statusColor = isActive ? "emerald" : isScheduled ? "blue" : isExpired ? "red" : "zinc";
  const statusText = isActive ? "ACTIVE" : isScheduled ? "SCHEDULED" : isExpired ? "EXPIRED" : "DRAFT";

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={priceList.id} className="border-0">
          <div className="px-4 md:px-6 py-3 md:py-4 flex justify-between w-full border-b relative min-h-[80px]">
            <div className="flex items-start gap-4">
              {/* Price List Icon */}
              <div className="w-12 h-12 flex-shrink-0 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                <BadgeDollarSign className="w-6 h-6 text-muted-foreground" />
              </div>

              {/* Price List Info */}
              <div className="flex flex-col items-start text-left gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/dashboard/platform/pricing?tab=price-lists&focus=${priceList.id}`}
                    className="font-medium text-base hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {priceList.name}
                  </Link>
                  <span>‧</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(priceList.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {priceList.description && (
                  <p className="text-sm text-muted-foreground">
                    {priceList.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="font-medium capitalize">{priceList.type}</span>
                  {priceList.customerGroups && priceList.customerGroups.length > 0 && (
                    <>
                      <span>‧</span>
                      <span>{priceList.customerGroups.length} customer groups</span>
                    </>
                  )}
                  {priceList.moneyAmounts && priceList.moneyAmounts.length > 0 && (
                    <>
                      <span>‧</span>
                      <div className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        <span>{priceList.moneyAmounts.length} prices</span>
                      </div>
                    </>
                  )}
                  {priceList.startsAt && (
                    <>
                      <span>‧</span>
                      <span>Starts {new Date(priceList.startsAt).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between h-full">
              <div className="flex items-center gap-2">
                <Badge
                  color={statusColor}
                  className="text-[.6rem] sm:text-[.7rem] py-0 px-2 sm:px-3 tracking-wide font-medium rounded-md border h-6"
                >
                  {statusText}
                </Badge>

                <Badge variant="outline" className="text-xs capitalize">
                  {priceList.type}
                </Badge>

                <div className="absolute bottom-3 right-5 sm:static flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="border [&_svg]:size-3 h-6 w-6"
                      >
                        <MoreVertical className="stroke-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsEditDrawerOpen(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Price List
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="secondary"
                    size="icon"
                    className="border [&_svg]:size-3 h-6 w-6"
                    asChild
                  >
                    <AccordionTrigger className="py-0" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <AccordionContent className="pb-0">
            <div className="px-4 md:px-6 py-4 space-y-4">
              {/* Price List Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="ml-2 font-medium capitalize">{priceList.type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className="ml-2 font-medium capitalize">{priceList.status}</span>
                </div>
                {priceList.startsAt && (
                  <div>
                    <span className="text-muted-foreground">Starts:</span>
                    <span className="ml-2 font-medium">
                      {new Date(priceList.startsAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {priceList.endsAt && (
                  <div>
                    <span className="text-muted-foreground">Ends:</span>
                    <span className="ml-2 font-medium">
                      {new Date(priceList.endsAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Customer Groups */}
              {priceList.customerGroups && priceList.customerGroups.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Customer Groups</h4>
                  <div className="flex flex-wrap gap-2">
                    {priceList.customerGroups.map((group) => (
                      <Badge key={group.id} variant="secondary">
                        {group.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Prices */}
              {priceList.moneyAmounts && priceList.moneyAmounts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Product Prices</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {priceList.moneyAmounts.slice(0, 5).map((amount) => (
                      <div key={amount.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{amount.productVariant.product.title}</span>
                          <span className="text-muted-foreground">‧</span>
                          <span className="text-muted-foreground">{amount.productVariant.title}</span>
                          {amount.productVariant.sku && (
                            <>
                              <span className="text-muted-foreground">‧</span>
                              <span className="font-mono text-xs">{amount.productVariant.sku}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {amount.compareAmount && amount.compareAmount !== amount.amount && (
                            <span className="text-muted-foreground line-through">
                              {amount.currency.symbol}{amount.compareAmount}
                            </span>
                          )}
                          <span className="font-medium">
                            {amount.currency.symbol}{amount.amount}
                          </span>
                        </div>
                      </div>
                    ))}
                    {priceList.moneyAmounts.length > 5 && (
                      <div className="text-center text-sm text-muted-foreground py-2">
                        +{priceList.moneyAmounts.length - 5} more prices
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <EditItemDrawer
        listKey="priceLists"
        itemId={priceList.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
      />
    </>
  );
}