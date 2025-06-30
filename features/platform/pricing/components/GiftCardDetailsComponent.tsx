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
import { MoreVertical, Gift, Edit, Trash } from "lucide-react";
import Link from "next/link";
import { EditItemDrawer } from "../../components/EditItemDrawer";
import { GiftCard } from "../actions/gift-card-actions";

interface GiftCardDetailsComponentProps {
  giftCard: GiftCard;
  list: any;
}

export function GiftCardDetailsComponent({ giftCard, list }: GiftCardDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  const isActive = !giftCard.isDisabled && giftCard.balance > 0;
  const isDepleted = giftCard.balance === 0;
  const statusColor = giftCard.isDisabled ? "red" : isDepleted ? "yellow" : "emerald";
  const statusText = giftCard.isDisabled ? "DISABLED" : isDepleted ? "DEPLETED" : "ACTIVE";

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={giftCard.id} className="border-0">
          <div className="px-4 md:px-6 py-3 md:py-4 flex justify-between w-full border-b relative min-h-[80px]">
            <div className="flex items-start gap-4">
              {/* Gift Card Icon */}
              <div className="w-12 h-12 flex-shrink-0 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                <Gift className="w-6 h-6 text-muted-foreground" />
              </div>

              {/* Gift Card Info */}
              <div className="flex flex-col items-start text-left gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/dashboard/platform/pricing?tab=gift-cards&focus=${giftCard.id}`}
                    className="font-medium text-base hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {giftCard.code}
                  </Link>
                  <span>‧</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(giftCard.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="font-medium">
                    Balance: {giftCard.region?.currency?.symbol || '$'}{giftCard.balance}
                  </span>
                  <span>of {giftCard.region?.currency?.symbol || '$'}{giftCard.value}</span>
                  {giftCard.region && (
                    <>
                      <span>‧</span>
                      <span>{giftCard.region.name}</span>
                    </>
                  )}
                  {giftCard.giftCardTransactions && (
                    <>
                      <span>‧</span>
                      <span>{giftCard.giftCardTransactions.length} transactions</span>
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
                        Edit Gift Card
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
              {/* Balance and Info */}
              <div className="text-center py-4">
                <div className="text-3xl font-bold">
                  {giftCard.region?.currency?.symbol || '$'}{giftCard.balance}
                </div>
                <div className="text-muted-foreground">
                  of {giftCard.region?.currency?.symbol || '$'}{giftCard.value} remaining
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Original Value:</span>
                  <span className="ml-2 font-medium">
                    {giftCard.region?.currency?.symbol || '$'}{giftCard.value}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Region:</span>
                  <span className="ml-2 font-medium">{giftCard.region?.name || 'N/A'}</span>
                </div>
                {giftCard.endsAt && (
                  <div>
                    <span className="text-muted-foreground">Expires:</span>
                    <span className="ml-2 font-medium">
                      {new Date(giftCard.endsAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {giftCard.order && (
                  <div>
                    <span className="text-muted-foreground">Purchase Order:</span>
                    <Badge variant="outline" className="ml-2">
                      #{giftCard.order.displayId}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Transaction History */}
              {giftCard.giftCardTransactions && giftCard.giftCardTransactions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Transaction History</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {giftCard.giftCardTransactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <div className="flex items-center gap-2 text-sm">
                          <span className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount > 0 ? '+' : ''}{giftCard.region?.currency?.symbol || '$'}{Math.abs(transaction.amount)}
                          </span>
                          {transaction.order && (
                            <>
                              <span className="text-muted-foreground">‧</span>
                              <span>#{transaction.order.displayId}</span>
                            </>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString()}
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

      <EditItemDrawer
        listKey="giftCards"
        itemId={giftCard.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
      />
    </>
  );
}