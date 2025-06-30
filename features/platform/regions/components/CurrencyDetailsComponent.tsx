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
import { MoreVertical, DollarSign, Edit, Trash } from "lucide-react";
import Link from "next/link";
import { EditItemDrawer } from "../../components/EditItemDrawer";
import { Currency } from "../actions/currency-actions";

interface CurrencyDetailsComponentProps {
  currency: Currency;
  list: any;
}

export function CurrencyDetailsComponent({ currency, list }: CurrencyDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  const isActive = currency.regions && currency.regions.length > 0;
  const statusColor = isActive ? "emerald" : "zinc";
  const statusText = isActive ? "ACTIVE" : "UNUSED";

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={currency.id} className="border-0">
          <div className="px-4 md:px-6 py-3 md:py-4 flex justify-between w-full border-b relative min-h-[80px]">
            <div className="flex items-start gap-4">
              {/* Currency Symbol */}
              <div className="w-12 h-12 flex-shrink-0 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                <span className="text-xl font-bold text-muted-foreground">
                  {currency.symbol || <DollarSign className="w-6 h-6" />}
                </span>
              </div>

              {/* Currency Info */}
              <div className="flex flex-col items-start text-left gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/dashboard/platform/regions?tab=currencies&focus=${currency.id}`}
                    className="font-medium text-base hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {currency.name}
                  </Link>
                  <span>‧</span>
                  <span className="text-sm text-muted-foreground font-mono font-bold">
                    {currency.code}
                  </span>
                  <span>‧</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(currency.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Symbol: {currency.symbol}</span>
                  {currency.symbolNative !== currency.symbol && (
                    <>
                      <span>‧</span>
                      <span>Native: {currency.symbolNative}</span>
                    </>
                  )}
                  {currency.regions && currency.regions.length > 0 && (
                    <>
                      <span>‧</span>
                      <span>{currency.regions.length} region{currency.regions.length !== 1 ? 's' : ''}</span>
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
                        Edit Currency
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Code:</span>
                  <span className="ml-2 font-medium font-mono">{currency.code}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Symbol:</span>
                  <span className="ml-2 font-medium text-lg">{currency.symbol}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Native Symbol:</span>
                  <span className="ml-2 font-medium text-lg">{currency.symbolNative}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Regions:</span>
                  <span className="ml-2 font-medium">{currency.regions?.length || 0}</span>
                </div>
              </div>

              {/* Regions using this currency */}
              {currency.regions && currency.regions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Used by Regions</h4>
                  <div className="flex flex-wrap gap-2">
                    {currency.regions.map((region) => (
                      <Badge key={region.id} variant="secondary">
                        {region.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <EditItemDrawer
        listKey="currencies"
        itemId={currency.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
      />
    </>
  );
}