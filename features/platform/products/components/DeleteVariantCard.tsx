import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";

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

export function DeleteVariantCard({
  variant,
  regions = [],
  onKeepVariant,
  renderOptionValue = (ov) => (
    <Badge
      color="zinc"
      className="uppercase rounded-md border text-[.65rem] py-[.0625rem] px-1.5 font-medium"
    >
      <span className="opacity-80 mr-1">{ov.option}:</span>
      {ov.label}
    </Badge>
  ),
}) {
  return (
    <Accordion type="single" collapsible className="border rounded-lg bg-muted/40">
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
                          <div
                            key={region.code}
                            className="h-6 flex items-center gap-1 px-2 rounded-md text-xs border"
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
                            </span>
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={onKeepVariant}
                className="h-7 uppercase text-xs tracking-wide"
              >
                Keep Variant
              </Button>
              <Badge
                color="rose"
                className="mt-4 py-0.5 text-xs rounded-full border uppercase font-medium tracking-wide"
              >
                TO BE DELETED
              </Badge>
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