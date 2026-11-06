"use client";
import { ViewerTime } from '@/features/dashboard/components/ViewerTime';

import React, { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, ArrowRight, ShoppingBag, CreditCard } from "lucide-react";
import Link from "next/link";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";
import { ItemPagination } from "../../orders/components/ItemPagination";
import { GiftCard } from "../actions";
import { refundGiftCardAction, voidGiftCardAction } from "../actions/gift-card-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const LEDGER_LABEL: Record<string, string> = {
  issue: "Issued",
  hold: "Used at checkout",
  release: "Checkout cancelled, returned",
  return: "Returned from an order",
  refund: "Refunded to the buyer's card",
  void: "Voided",
};

interface GiftCardDetailsComponentProps {
  giftcard: GiftCard;
  list: any;
}

type TabType = 'transactions';

export function GiftCardDetailsComponent({
  giftcard,
  list,
}: GiftCardDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('transactions');
  const [currentPages, setCurrentPages] = useState<Record<TabType, number>>({
    transactions: 1
  });
  const [editItemId, setEditItemId] = useState<string>('');
  const [editItemOpen, setEditItemOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const router = useRouter();
  const meta = (giftcard.metadata || {}) as any;
  const ledger: any[] = Array.isArray(meta.ledger) ? meta.ledger : [];
  const canRefund = !!meta.paymentIntentId && !giftcard.isDisabled && giftcard.balance > 0;

  const runAction = async (kind: "refund" | "void") => {
    const amount = new Intl.NumberFormat('en-US', { style: 'currency', currency: (meta.currencyCode || giftcard.region?.currency?.code || 'USD').toUpperCase() }).format(giftcard.balance / 100);
    const question = kind === "refund"
      ? `Refund the remaining ${amount} to the buyer's card? The gift card stops working.`
      : `Void this gift card? The remaining ${amount} is not refunded.`;
    const reason = window.prompt(`${question}\n\nReason:`, kind === "refund" ? "Customer asked for a refund" : "");
    if (!reason?.trim()) return;
    setWorking(true);
    const result: any = kind === "refund" ? await refundGiftCardAction(giftcard.id, reason) : await voidGiftCardAction(giftcard.id, reason);
    setWorking(false);
    if (!result?.success) { toast.error(result?.error || "That didn't work."); return; }
    toast.success(kind === "refund" ? `Refunded ${amount} to the buyer's card.` : "Gift card voided.");
    router.refresh();
  };
  const itemsPerPage = 5;

  const isActive = !giftcard.isDisabled && (!giftcard.endsAt || new Date(giftcard.endsAt) > new Date());
  const usagePercentage = giftcard.value > 0 ? ((giftcard.value - giftcard.balance) / giftcard.value) * 100 : 0;
  const hasBeenUsed = giftcard.value !== giftcard.balance;

  // Prepare data for tabs
  const transactionsData = giftcard.giftCardTransactions || [];

  const tabs = [
    { 
      key: 'transactions' as TabType, 
      label: `Transactions`,
      count: transactionsData.length,
      data: transactionsData
    }
  ];

  const activeTabData = tabs.find(tab => tab.key === activeTab);

  const handlePageChange = (tabKey: TabType, newPage: number) => {
    setCurrentPages(prev => ({
      ...prev,
      [tabKey]: newPage
    }));
  };

  const formatCurrency = (amount: number) => {
    const currency = (meta.currencyCode || giftcard.region?.currency?.code || 'USD').toUpperCase();
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100);
  };

  const handleEditItem = (itemId: string) => {
    setEditItemId(itemId);
    setEditItemOpen(true);
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
                    <ViewerTime value={giftcard.createdAt} style="dateLong" />
                  </span>
                  {giftcard.order && giftcard.order.user && (
                    <>
                      <span className="mx-1.5">‧</span>
                      <Link
                        href={`/dashboard/users/${giftcard.order.user.id}`}
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

              {meta.purchaserEmail && (
                <div className="text-sm text-muted-foreground break-all">
                  Bought online by {meta.purchaserName || meta.purchaserEmail}
                  {meta.recipientEmail && meta.recipientEmail !== meta.purchaserEmail
                    ? ` for ${meta.recipientName || meta.recipientEmail} (${meta.recipientEmail})`
                    : ` (${meta.purchaserEmail})`}
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
                      Expires <ViewerTime value={giftcard.endsAt} style="date" />
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-between h-full">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <span aria-hidden="true" className={`size-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-zinc-400"}`} />
                  {isActive ? "Active" : meta.refundedAt ? "Refunded" : giftcard.isDisabled ? "Voided" : giftcard.balance <= 0 ? "Used up" : "Expired"}
                </span>
                
                {/* Action buttons */}
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
                      {canRefund && (
                        <DropdownMenuItem disabled={working} onClick={() => runAction("refund")}>
                          Refund balance to buyer
                        </DropdownMenuItem>
                      )}
                      {!giftcard.isDisabled && (
                        <DropdownMenuItem disabled={working} onClick={() => runAction("void")}>
                          Void gift card
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => setIsEditDrawerOpen(true)}>
                        Edit Gift Card
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
            {ledger.length > 0 && (
              <div className="px-4 md:px-6 py-3 border-b">
                <p className="text-xs font-medium text-muted-foreground mb-2">Balance history</p>
                <ul className="divide-y text-sm">
                  {ledger.slice().reverse().map((row: any, index: number) => (
                    <li key={index} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2">
                      <span className="min-w-0">
                        {LEDGER_LABEL[row.type] || row.type}
                        {row.note ? <span className="text-muted-foreground"> · {row.note}</span> : null}
                        <span className="block text-xs text-muted-foreground"><ViewerTime value={row.at} style="long" fallback="" /></span>
                      </span>
                      <span className="text-right tabular-nums">
                        {row.type === "issue" || row.type === "release" || row.type === "return" ? "+" : "−"}{formatCurrency(row.amount)}
                        <span className="block text-xs text-muted-foreground">Balance {formatCurrency(row.balance)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Responsive Tabs Navigation */}
            <div className="bg-muted/40">
              {/* Desktop: Horizontal Tab Buttons */}
              <div className="hidden md:flex items-center gap-3 px-4 pt-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative z-10 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-300 border ${
                      activeTab === tab.key 
                        ? 'bg-background border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100' 
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-background/50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>
                        {tab.key === 'transactions' && 'Transactions'}
                      </span>
                      <span className="rounded-sm bg-muted border px-1.5 py-0 text-xs leading-[14px] font-medium text-muted-foreground inline-flex items-center h-[18px] -mr-1">
                        {tab.count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Mobile: Select Dropdown */}
              <div className="md:hidden px-4 py-2">
                <div className="w-fit">
                  <Select value={activeTab} onValueChange={(value: TabType) => setActiveTab(value)}>
                    <SelectTrigger className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-background border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 h-auto w-auto">
                      <div className="flex items-center gap-1.5">
                        <SelectValue />
                        <span className="rounded-sm bg-muted border px-1.5 py-0 text-xs leading-[14px] font-medium text-muted-foreground inline-flex items-center h-[18px] -mr-1">
                          ({activeTabData?.count || 0})
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {tabs.map((tab) => (
                        <SelectItem key={tab.key} value={tab.key} className="text-xs">
                          {tab.key === 'transactions' && 'Transactions'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Tab Content Area */}
            <div className="bg-muted/40">
              {activeTabData && (
                <>
                  {/* Pagination for active tab */}
                  {activeTabData.count > itemsPerPage && (
                    <div className="flex justify-between items-center p-4 pb-2">
                      <div />
                      <ItemPagination
                        currentPage={currentPages[activeTab]}
                        totalItems={activeTabData.count}
                        itemsPerPage={itemsPerPage}
                        onPageChange={(newPage) => handlePageChange(activeTab, newPage)}
                      />
                    </div>
                  )}

                  <div className="px-4 py-2">
                    {/* Transactions Tab */}
                    {activeTab === 'transactions' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {transactionsData.length > 0 ? (
                          transactionsData.slice(
                            (currentPages.transactions - 1) * itemsPerPage,
                            currentPages.transactions * itemsPerPage
                          ).map((transaction) => (
                            transaction.order && (
                              <div key={transaction.id} className="rounded-md border bg-background p-3 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <CreditCard className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <Link
                                        href={`/dashboard/platform/orders/${transaction.order.id}`}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                      >
                                        #{transaction.order.displayId}
                                      </Link>
                                      <div className="text-xs text-muted-foreground">
                                        <ViewerTime value={transaction.createdAt} style="date" />
                                      </div>
                                    </div>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 shrink-0"
                                      >
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEditItem(transaction.id)}>
                                        Edit Transaction
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">Order Total:</span>
                                  <span className="font-medium">{transaction.order.total}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">Gift Card Used:</span>
                                  <span className="font-medium text-red-600">
                                    -{formatCurrency(transaction.amount)}
                                  </span>
                                </div>
                              </div>
                            )
                          ))
                        ) : (
                          <div className="col-span-full text-center py-8 text-muted-foreground">
                            <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No transactions have used this gift card yet</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
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

      {/* Edit Item Drawer */}
      {editItemId && (
        <EditItemDrawerClientWrapper
          listKey="gift-card-transactions"
          itemId={editItemId}
          open={editItemOpen}
          onClose={() => {
            setEditItemOpen(false);
            setEditItemId('');
          }}
        />
      )}
    </>
  );
}