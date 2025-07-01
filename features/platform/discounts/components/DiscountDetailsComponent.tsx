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
import { MoreVertical, Tag, Edit, Trash, Users } from "lucide-react";
import Link from "next/link";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";
import { Discount } from "../actions";

interface DiscountDetailsComponentProps {
  discount: Discount;
  list: any;
}

export function DiscountDetailsComponent({ discount, list }: DiscountDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  const isActive = !discount.isDisabled && (!discount.endsAt || new Date(discount.endsAt) > new Date());
  const statusColor = isActive ? "emerald" : discount.isDisabled ? "zinc" : "red";
  const statusText = isActive ? "ACTIVE" : discount.isDisabled ? "DISABLED" : "EXPIRED";

  const usagePercentage = discount.usageLimit ? (discount.usageCount || 0) / discount.usageLimit * 100 : 0;

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={discount.id} className="border-0">
          <div className="px-4 md:px-6 py-3 md:py-4 flex justify-between w-full border-b relative min-h-[80px]">
            <div className="flex items-start gap-4">
              {/* Discount Icon */}
              <div className="w-12 h-12 flex-shrink-0 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                <Tag className="w-6 h-6 text-muted-foreground" />
              </div>

              {/* Discount Info */}
              <div className="flex flex-col items-start text-left gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/dashboard/platform/discounts?focus=${discount.id}`}
                    className="font-medium text-base hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {discount.code}
                  </Link>
                  <span>‧</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(discount.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {discount.discountRule?.description && (
                  <p className="text-sm text-muted-foreground">
                    {discount.discountRule.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  {discount.discountRule && (
                    <>
                      <span className="font-medium">
                        {discount.discountRule.type === 'percentage' 
                          ? `${discount.discountRule.value}%` 
                          : discount.discountRule.type === 'fixed'
                          ? `$${discount.discountRule.value}`
                          : 'Free Shipping'
                        } off
                      </span>
                      <span>‧</span>
                    </>
                  )}
                  <span>{discount.usageCount || 0} uses</span>
                  {discount.usageLimit && (
                    <>
                      <span>of {discount.usageLimit}</span>
                      <span>‧</span>
                    </>
                  )}
                  {discount.orders && discount.orders.length > 0 && (
                    <>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{discount.orders.length} orders</span>
                      </div>
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

                {discount.discountRule && (
                  <Badge variant="outline" className="text-xs">
                    {discount.discountRule.type}
                  </Badge>
                )}

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
                        Edit Discount
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
              {/* Discount Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="ml-2 font-medium capitalize">{discount.discountRule?.type || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Value:</span>
                  <span className="ml-2 font-medium">
                    {discount.discountRule?.value 
                      ? discount.discountRule.type === 'percentage' 
                        ? `${discount.discountRule.value}%`
                        : `$${discount.discountRule.value}`
                      : 'N/A'
                    }
                  </span>
                </div>
                {discount.startsAt && (
                  <div>
                    <span className="text-muted-foreground">Starts:</span>
                    <span className="ml-2 font-medium">
                      {new Date(discount.startsAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {discount.endsAt && (
                  <div>
                    <span className="text-muted-foreground">Ends:</span>
                    <span className="ml-2 font-medium">
                      {new Date(discount.endsAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Usage Progress */}
              {discount.usageLimit && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Usage</span>
                    <span className="font-medium">
                      {discount.usageCount || 0} / {discount.usageLimit}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all" 
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Recent Orders */}
              {discount.orders && discount.orders.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Recent Orders</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {discount.orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">#{order.displayId}</span>
                          <span className="text-muted-foreground">‧</span>
                          <span>{order.user.name}</span>
                        </div>
                        <div className="text-sm font-medium">
                          {order.currency.symbol}{order.total}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <EditItemDrawerClientWrapper
        listKey="discounts"
        itemId={discount.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
      />
    </>
  );
}