"use client";

import React, { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, ChevronsUpDown, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";
import { GiftCard } from "../actions";

interface GiftCardDetailsComponentProps {
  giftcard: GiftCard;
  list: any;
}

export function GiftCardDetailsComponent({
  giftcard,
  list,
}: GiftCardDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isTransactionsOpen, setIsTransactionsOpen] = useState(true);

  const isActive = !giftcard.isDisabled && (!giftcard.endsAt || new Date(giftcard.endsAt) > new Date());
  const usagePercentage = giftcard.value > 0 ? ((giftcard.value - giftcard.balance) / giftcard.value) * 100 : 0;
  const hasBeenUsed = giftcard.value !== giftcard.balance;
  
  const triggerClassName =
    "flex items-center rounded-sm shadow-sm uppercase tracking-wide border max-w-fit gap-2 text-nowrap pl-2.5 pr-1 py-[3px] text-sm font-medium text-slate-500 bg-white border-slate-200 hover:bg-slate-100 hover:text-slate-700 focus:z-10 focus:ring-2 focus:ring-slate-700 focus:text-slate-700 dark:bg-slate-950 dark:border-slate-900 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700 dark:focus:ring-slate-500 dark:focus:text-white";

  const formatCurrency = (amount: number) => {
    const currency = giftcard.region?.currency?.code || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100);
  };

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={giftcard.id} className="border-0">
          <div className="px-4 md:px-6 py-3 md:py-4 flex justify-between w-full border-b relative min-h-[100px]">
            <div className="flex flex-col items-start text-left gap-2 sm:gap-1.5">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <Link
                  href={`/dashboard/platform/gift-cards/${giftcard.id}`}
                  className="font-medium text-base hover:text-blue-600 dark:hover:text-blue-400 font-mono"
                >
                  {giftcard.code}
                </Link>
                <span className="text-sm font-medium">
                  <span className="text-muted-foreground/75">
                    {new Date(giftcard.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  {giftcard.order && giftcard.order.user && (
                    <>
                      <span className="mx-1.5">‧</span>
                      <Link
                        href={`/dashboard/platform/users/${giftcard.order.user.id}`}
                        className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 group inline-flex items-center gap-1"
                      >
                        {giftcard.order.user.name || giftcard.order.user.email}
                        <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                      </Link>
                    </>
                  )}
                </span>
              </div>

              {/* Purchase Order Info */}
              {giftcard.order && (
                <div className="flex flex-wrap items-center gap-1.5 text-sm">
                  <span className="text-muted-foreground">Purchased in</span>
                  <Link
                    href={`/dashboard/platform/orders/${giftcard.order.id}`}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    #{giftcard.order.displayId}
                  </Link>
                  <span>‧</span>
                  <span className="font-medium">{giftcard.order.total}</span>
                </div>
              )}

              {/* Balance Information */}
              <div className="flex flex-wrap items-center gap-1.5 text-sm">
                <span className="font-medium text-emerald-600">
                  {formatCurrency(giftcard.balance)} remaining
                </span>
                <span className="text-muted-foreground">of {formatCurrency(giftcard.value)}</span>
                {hasBeenUsed && (
                  <>
                    <span>‧</span>
                    <span className="text-muted-foreground">
                      {usagePercentage.toFixed(0)}% used
                    </span>
                  </>
                )}
                {giftcard.endsAt && (
                  <>
                    <span>‧</span>
                    <span className="text-muted-foreground">
                      Expires {new Date(giftcard.endsAt).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-between h-full">
              <div className="flex items-center gap-2">
                <Badge
                  color={isActive ? "emerald" : "zinc"}
                  className="text-[.6rem] sm:text-[.7rem] py-0 px-2 sm:px-3 tracking-wide font-medium rounded-md border h-6"
                >
                  {isActive ? "ACTIVE" : giftcard.isDisabled ? "DISABLED" : "EXPIRED"}
                </Badge>
                
                {/* Action buttons */}
                <div className="absolute bottom-3 right-5 sm:static flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="border [&_svg]:size-3 h-6 w-6"
                    onClick={() => setIsEditDrawerOpen(true)}
                  >
                    <MoreVertical className="stroke-muted-foreground" />
                  </Button>
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
            <div className="divide-y">
              {/* Orders Section - showing orders that used this gift card - ALWAYS SHOW */}
              <Collapsible
                open={isTransactionsOpen}
                onOpenChange={setIsTransactionsOpen}
                className="flex flex-col gap-2 py-3 px-4 md:px-6 bg-slate-50/30 dark:bg-slate-900/10 border-b"
              >
                <div className="flex items-center justify-between w-full">
                  <CollapsibleTrigger asChild>
                    <button type="button" className={triggerClassName}>
                      <ShoppingBag className="w-4 h-4" />
                      {(giftcard.giftCardTransactions || []).length} Order{(giftcard.giftCardTransactions || []).length !== 1 ? "s" : ""}
                      <ChevronsUpDown className="h-4 w-4" />
                    </button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="space-y-2">
                  {isTransactionsOpen && (
                    <div className="space-y-2">
                      {giftcard.giftCardTransactions && giftcard.giftCardTransactions.length > 0 ? (
                        giftcard.giftCardTransactions.map((transaction) => (
                          transaction.order && (
                            <div key={transaction.id} className="bg-white dark:bg-slate-900/50 rounded-lg border p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <Link
                                    href={`/dashboard/platform/orders/${transaction.order.id}`}
                                    className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                  >
                                    #{transaction.order.displayId}
                                  </Link>
                                  <div className="text-sm text-muted-foreground">
                                    {new Date(transaction.createdAt).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "numeric",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">{transaction.order.total}</div>
                                  <div className="text-sm text-red-600">
                                    -{formatCurrency(transaction.amount)} used
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No orders have used this gift card yet</p>
                        </div>
                      )}
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <EditItemDrawerClientWrapper
        listKey="gift-cards"
        itemId={giftcard.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
      />
    </>
  );
}