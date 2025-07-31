import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Trash2,
  Package,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
} from "lucide-react";
import { useState, useEffect, useMemo, useId } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { BadgeButton } from "@/components/ui/badge-button";
import { VariantForm } from "./VariantsTab";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Simple debug utility that won't affect component lifecycle
// Only logs in development and can be globally toggled
const DEBUG = {
  enabled: process.env.NODE_ENV === "development",
  log: (label, data) => {
    if (DEBUG.enabled) {
      console.log(`[${label}]`, data);
    }
  },
  group: (label, callback) => {
    if (DEBUG.enabled) {
      console.group(`[${label}]`);
      callback();
      console.groupEnd();
    }
  },
};

// Helper to format prices consistently
const formatPrice = (amount, locale, currency) => {
  if (amount === undefined || amount === null) return "";

  const noDivisionCurrencies = ["jpy", "krw", "vnd"];
  const currencyCode = currency.toUpperCase();
  const isNoDivision = noDivisionCurrencies.includes(currency.toLowerCase());

  return new Intl.NumberFormat(locale || "en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: isNoDivision ? 0 : 2,
    maximumFractionDigits: isNoDivision ? 0 : 2,
  }).format(isNoDivision ? amount : amount / 100);
};

// Helper functions for price formatting
const convertToStorageAmount = (displayAmount, currencyCode) => {
  const noDivisionCurrencies = ["jpy", "krw", "vnd"];
  const isNoDivision = noDivisionCurrencies.includes(
    currencyCode.toLowerCase()
  );

  const numericAmount =
    typeof displayAmount === "string"
      ? parseFloat(displayAmount.replace(/[^0-9.-]+/g, ""))
      : displayAmount;

  return isNoDivision
    ? Math.round(numericAmount)
    : Math.round(numericAmount * 100);
};

const formatDisplayAmount = (storageAmount, currencyCode) => {
  const noDivisionCurrencies = ["jpy", "krw", "vnd"];
  const isNoDivision = noDivisionCurrencies.includes(
    currencyCode.toLowerCase()
  );
  return isNoDivision
    ? storageAmount.toString()
    : (storageAmount / 100).toString();
};

// Price form for existing variants
const PriceForm = ({ region, initialPrice, onSave, onCancel }) => {
  const [amount, setAmount] = useState(
    initialPrice?.amount
      ? formatDisplayAmount(initialPrice.amount, region.currency.code)
      : ""
  );
  const [compareAmount, setCompareAmount] = useState(
    initialPrice?.compareAmount
      ? formatDisplayAmount(initialPrice.compareAmount, region.currency.code)
      : ""
  );

  const handleSave = () => {
    if (!amount || isNaN(parseFloat(amount))) return;
    const storageAmount = convertToStorageAmount(amount, region.currency.code);
    const storageCompareAmount = compareAmount
      ? convertToStorageAmount(compareAmount, region.currency.code)
      : null;
    onSave({
      amount: storageAmount,
      compareAmount: storageCompareAmount,
      regionCode: region.code,
      currencyCode: region.currency.code,
      ...(initialPrice?.id ? { priceId: initialPrice.id } : {}),
    });
  };

  return (
    <div className="flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-medium text-sm mb-1">
          {initialPrice ? "Update Price" : "Add Price"}
        </h3>
        <p className="text-muted-foreground text-xs">
          {region.name} • {region.currency.code.toUpperCase()}
          {region.taxRate ? ` • ${(region.taxRate * 100).toFixed(0)}% tax` : ""}
        </p>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <div className="text-xs mb-2">Price</div>
          <div className="relative">
            <Input
              type="text"
              value={amount}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^\d*\.?\d*$/.test(val)) {
                  setAmount(val);
                }
              }}
              className="peer ps-5 pe-10 h-8 text-sm"
              placeholder="0.00"
            />
            <span className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 text-xs">
              {region.currency.symbolNative}
            </span>
            <span className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-2 text-xs">
              {region.currency.code.toUpperCase()}
            </span>
          </div>
        </div>
        <div>
          <div className="text-xs mb-2">Compare at Price (Optional)</div>
          <div className="relative">
            <Input
              type="text"
              value={compareAmount}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^\d*\.?\d*$/.test(val)) {
                  setCompareAmount(val);
                }
              }}
              className="peer ps-5 pe-10 h-8 text-sm"
              placeholder="0.00"
            />
            <span className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 text-xs">
              {region.currency.symbolNative}
            </span>
            <span className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-2 text-xs">
              {region.currency.code.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 p-4 border-t">
        <PopoverClose asChild>
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </PopoverClose>
        <PopoverClose asChild>
          <BadgeButton
            onClick={handleSave}
            className="font-medium border rounded-lg text-xs items-center"
          >
            {initialPrice ? "Update Price" : "Add Price"}
          </BadgeButton>
        </PopoverClose>
      </div>
    </div>
  );
};

// Clean VariantCard for existing variants only
export function VariantCard({
  variant,
  onUpdate,
  onDelete,
  showActions = true,
  regions = [],
  onAddPrice,
  selectedFilters = [],
  onOptionFilter,
  renderOptionValue = (ov) => (
    <Badge
      color="zinc"
      className={cn(
        "uppercase rounded-md border text-[.65rem] py-[.0625rem] px-1.5 font-medium cursor-pointer hover:bg-accent/50",
        selectedFilters.includes(`${ov.option}:${ov.value}`) && "bg-accent"
      )}
      onClick={() => onOptionFilter?.(ov.option, ov.value)}
    >
      <span className="opacity-80 mr-1">{ov.option}:</span>
      {ov.label}
    </Badge>
  ),
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentVariant, setCurrentVariant] = useState(variant);
  const [openPriceId, setOpenPriceId] = useState(null);

  useEffect(() => {
    setCurrentVariant(variant);
  }, [variant]);

  const handleSave = () => {
    onUpdate?.(currentVariant);
    setIsOpen(false);
  };

  const handlePriceUpdate = (priceData) => {
    onAddPrice?.(variant, priceData);
    setOpenPriceId(null);
  };

  return (
    <Accordion
      type="single"
      collapsible
      className="border rounded-lg bg-muted/40"
    >
      <AccordionItem value="details" className="border-0">
        <div className="p-4">
          <div className="flex justify-between">
            <div className="flex gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border bg-background">
                <Package className="h-6 w-6 text-foreground/60" />
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-sm font-medium">{variant.title}</div>
                  {variant.productOptionValues?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {variant.productOptionValues.map((ov, i) => (
                        <div key={i}>
                          {renderOptionValue({
                            option: ov.productOption.title,
                            value: ov.value,
                            label: ov.value,
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-0.5">
                  <div className="text-[.65rem] font-medium text-muted-foreground uppercase tracking-wider">
                    Prices
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {regions.map((region) => {
                      const existingPrice = variant.prices?.find(
                        (p) => p.region?.code === region.code
                      );

                      if (existingPrice) {
                        return (
                          <Popover
                            key={region.code}
                            open={openPriceId === existingPrice.id}
                            onOpenChange={(isOpen) =>
                              setOpenPriceId(isOpen ? existingPrice.id : null)
                            }
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 cursor-pointer flex items-center gap-1 px-2 rounded-md text-xs hover:bg-accent"
                              >
                                <span className="uppercase font-bold text-[0.6rem] text-muted-foreground mr-0.5">
                                  {region.currency.code}
                                </span>
                                <span>
                                  {formatPrice(
                                    existingPrice.amount,
                                    region.locale || "en-US",
                                    region.currency.code
                                  )}
                                  {existingPrice.compareAmount && (
                                    <span className="ml-1 line-through opacity-70">
                                      {formatPrice(
                                        existingPrice.compareAmount,
                                        region.locale || "en-US",
                                        region.currency.code
                                      )}
                                    </span>
                                  )}
                                </span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0 bg-white dark:bg-slate-950 border shadow-lg" align="end">
                              <PriceForm
                                region={region}
                                initialPrice={existingPrice}
                                onSave={handlePriceUpdate}
                                onCancel={() => setOpenPriceId(null)}
                              />
                            </PopoverContent>
                          </Popover>
                        );
                      }

                      return (
                        <Popover
                          key={region.code}
                          open={openPriceId === region.code}
                          onOpenChange={(isOpen) =>
                            setOpenPriceId(isOpen ? region.code : null)
                          }
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 bg-muted/40 hover:bg-muted gap-1 uppercase tracking-wide border px-2 rounded-md text-xs"
                            >
                              <span className="uppercase font-bold text-[0.6rem] text-muted-foreground mr-0.5">
                                {region.currency.code}
                              </span>
                              {region.currency.symbol} ADD
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-0 bg-white dark:bg-slate-950 border shadow-lg" align="end">
                            <PriceForm
                              region={region}
                              onSave={handlePriceUpdate}
                              onCancel={() => setOpenPriceId(null)}
                            />
                          </PopoverContent>
                        </Popover>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-1 items-start">
              {showActions && (
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6 [&_svg]:size-3"
                    >
                      <MoreHorizontal />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0 bg-white dark:bg-slate-950 border shadow-lg" align="end">
                    <VariantForm
                      variant={currentVariant}
                      onChange={setCurrentVariant}
                      onSave={handleSave}
                      onCancel={() => setIsOpen(false)}
                    />
                  </PopoverContent>
                </Popover>
              )}
              <AccordionTrigger className="py-0">
                <div className="inline-flex items-center justify-center h-6 w-6 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md [&_svg]:size-3">
                  <ChevronDown className="accordion-icon" />
                </div>
              </AccordionTrigger>
            </div>
          </div>
        </div>

        <AccordionContent className="px-4 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-3">
            <div className="space-y-1">
              <div className="text-[.65rem] font-medium text-muted-foreground uppercase tracking-wider">
                SKU
              </div>
              <div className="text-sm tabular-nums font-medium">
                {variant.sku || "-"}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[.65rem] font-medium text-muted-foreground uppercase tracking-wider">
                Stock
              </div>
              <div className="text-sm tabular-nums font-medium">
                {variant.inventoryQuantity || "0"}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[.65rem] font-medium text-muted-foreground uppercase tracking-wider">
                Barcode
              </div>
              <div className="text-sm tabular-nums">
                {variant.barcode || "-"}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[.65rem] font-medium text-muted-foreground uppercase tracking-wider">
                EAN
              </div>
              <div className="text-sm tabular-nums">{variant.ean || "-"}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[.65rem] font-medium text-muted-foreground uppercase tracking-wider">
                UPC
              </div>
              <div className="text-sm tabular-nums">{variant.upc || "-"}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[.65rem] font-medium text-muted-foreground uppercase tracking-wider">
                Material
              </div>
              <div className="text-sm">{variant.material || "-"}</div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}