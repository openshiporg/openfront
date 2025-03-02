import { Button } from "@ui/button";
import { Package, X, ChevronDown, Info, MoreHorizontal } from "lucide-react";
import { Badge, BadgeButton } from "@ui/badge";
import { Input } from "@ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "@ui/popover";
import { useState } from "react";
import { cn } from "@keystone/utils/cn";
import { DeleteVariantCard } from "./DeleteVariantCard";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip";
import { Label } from "@ui/label";

// Helper functions for price formatting
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

// Price form for pending variants
const PendingPriceForm = ({ region, initialPrice, onSave, onCancel }) => {
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
    });
  };

  return (
    <div className="flex flex-col">
      <div className="p-4 border-b bg-muted/40">
        <h3 className="font-medium text-sm mb-1">Set Price (Pending)</h3>
        <p className="text-muted-foreground text-xs">
          {region.name} • {region.currency.code.toUpperCase()}
          {region.taxRate ? ` • ${(region.taxRate * 100).toFixed(0)}% tax` : ""}
          <span className="block mt-1 font-medium">
            This price will be saved when the variant is created
          </span>
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
              placeholder="Enter price"
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
      <div className="flex justify-end gap-2 p-4 border-t bg-muted/40">
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
            Set for New Variant
          </BadgeButton>
        </PopoverClose>
      </div>
    </div>
  );
};

// Card component for pending variants
function PendingVariantCard({
  variant,
  onUpdate,
  onDelete,
  regions = [],
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
  const [openPriceId, setOpenPriceId] = useState(null);
  const [localPrices, setLocalPrices] = useState(variant.prices || []);
  const [isOpen, setIsOpen] = useState(false);
  const [currentVariant, setCurrentVariant] = useState(variant);

  const handlePriceAdd = (priceData) => {
    const updatedPrices = [...localPrices];
    const existingPriceIndex = updatedPrices.findIndex(
      (p) => p.region?.code === priceData.regionCode
    );

    const newPrice = {
      id:
        existingPriceIndex >= 0
          ? updatedPrices[existingPriceIndex].id
          : `pending-price-${Date.now()}`,
      amount: priceData.amount,
      compareAmount: priceData.compareAmount,
      region: {
        code: priceData.regionCode,
        ...(regions.find((r) => r.code === priceData.regionCode) || {}),
      },
      currency: {
        code: priceData.currencyCode,
        ...(regions.find((r) => r.code === priceData.regionCode)?.currency ||
          {}),
      },
    };

    if (existingPriceIndex >= 0) {
      updatedPrices[existingPriceIndex] = newPrice;
    } else {
      updatedPrices.push(newPrice);
    }

    setLocalPrices(updatedPrices);
    onUpdate({
      ...variant,
      prices: updatedPrices,
    });
    setOpenPriceId(null);
  };

  const handleVariantUpdate = (updatedFields) => {
    const updatedVariant = { ...currentVariant, ...updatedFields };
    setCurrentVariant(updatedVariant);
    onUpdate(updatedVariant);
  };

  return (
    <div className="border border-dashed rounded-lg bg-muted/40">
      <div className="p-4">
        <div className="flex justify-between">
          <div className="flex gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed bg-background">
              <Package className="h-6 w-6 text-foreground/60" />
            </div>
            <div>
              <div className="text-sm font-medium">{variant.title}</div>
              <div>
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
              <div className="space-y-0.5 mt-2">
                <div className="text-[.65rem] font-medium text-muted-foreground uppercase tracking-wider">
                  Prices (Pending)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {regions.map((region) => {
                    const existingPrice = localPrices.find(
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
                              className="h-6 cursor-pointer flex items-center gap-1 px-2 rounded-md text-xs hover:bg-accent border-dashed"
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
                          <PopoverContent className="w-80 p-0" align="end">
                            <PendingPriceForm
                              region={region}
                              initialPrice={existingPrice}
                              onSave={(data) =>
                                handlePriceAdd({
                                  ...data,
                                  regionCode: region.code,
                                  currencyCode: region.currency.code,
                                })
                              }
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
                            className="h-6 gap-1 uppercase tracking-wide border border-dashed px-2 rounded-md text-xs"
                          >
                            <span className="uppercase font-bold text-[0.6rem] text-muted-foreground mr-0.5">
                              {region.currency.code}
                            </span>
                            {region.currency.symbol} ADD
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0" align="end">
                          <PendingPriceForm
                            region={region}
                            onSave={(data) =>
                              handlePriceAdd({
                                ...data,
                                regionCode: region.code,
                                currencyCode: region.currency.code,
                              })
                            }
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
          <div className="flex flex-col gap-2 items-end justify-between">
            <div className="flex gap-1 items-start">
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
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="flex flex-col">
                    <div className="p-4 border-b">
                      <h3 className="font-medium text-sm mb-1">Edit Variant</h3>
                      <p className="text-muted-foreground text-xs">
                        Update variant properties
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="grid gap-3 h-72 overflow-y-auto p-4">
                        <div>
                          <Label className="text-xs">SKU</Label>
                          <Input
                            value={currentVariant.sku || ""}
                            onChange={(e) =>
                              handleVariantUpdate({ sku: e.target.value })
                            }
                            placeholder="SKU-123"
                            className="mt-1 h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Barcode</Label>
                          <Input
                            value={currentVariant.barcode || ""}
                            onChange={(e) =>
                              handleVariantUpdate({ barcode: e.target.value })
                            }
                            placeholder="123456789"
                            className="mt-1 h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">EAN</Label>
                          <Input
                            value={currentVariant.ean || ""}
                            onChange={(e) =>
                              handleVariantUpdate({ ean: e.target.value })
                            }
                            placeholder="1234567890123"
                            className="mt-1 h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">UPC</Label>
                          <Input
                            value={currentVariant.upc || ""}
                            onChange={(e) =>
                              handleVariantUpdate({ upc: e.target.value })
                            }
                            placeholder="123456789012"
                            className="mt-1 h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Stock</Label>
                          <Input
                            type="number"
                            value={currentVariant.inventoryQuantity || 100}
                            onChange={(e) =>
                              handleVariantUpdate({
                                inventoryQuantity: parseInt(e.target.value),
                              })
                            }
                            className="mt-1 h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Material</Label>
                          <Input
                            value={currentVariant.material || ""}
                            onChange={(e) =>
                              handleVariantUpdate({ material: e.target.value })
                            }
                            placeholder="Cotton, Polyester, etc."
                            className="mt-1 h-8 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 p-4 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => setIsOpen(false)}>
                        Save
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onDelete?.(variant)}
                className="h-6 w-6 [&_svg]:size-4 text-muted-foreground hover:text-destructive"
              >
                <X />
              </Button>
            </div>
            <Badge
              color="emerald"
              className="mt-4 py-0.5 text-xs rounded-full border uppercase font-medium tracking-wide"
            >
              PENDING
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main VariantDriftCard component
export function VariantDriftCard({
  variantsToCreate,
  variantsToDelete,
  unchangedVariants,
  onRemoveFromCreate,
  onRemoveFromDelete,
  onSaveChanges,
  regions = [],
}) {
  const [expandedSections, setExpandedSections] = useState({
    new: true,
    delete: true,
    unchanged: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Keep track of local state for pending variants
  const [localVariants, setLocalVariants] = useState(variantsToCreate);

  const handleVariantUpdate = (updatedVariant) => {
    const newVariants = localVariants.map((v) =>
      v.id === updatedVariant.id ? updatedVariant : v
    );
    setLocalVariants(newVariants);
  };

  const handleRemoveVariant = (variant) => {
    const newVariants = localVariants.filter((v) => v.id !== variant.id);
    setLocalVariants(newVariants);
    onRemoveFromCreate(variant);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <h3 className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
              All Changes
            </h3>
            <Tooltip>
              <TooltipTrigger>
                <Info className="size-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="text-xs max-w-[300px]">
                We&apos;ve found changes in option values that affect your variants.
                Here&apos;s a summary of the variants that need to be added, removed,
                or unchanged.
              </TooltipContent>
            </Tooltip>
          </div>
          {/* <p className="text-muted-foreground text-xs">
            Option values have changed and variant drift has been detected. Based on the exiting options and values, we have detected the following variants that have been added, removed, or unchanged.
          </p> */}
          <div className="flex gap-1 text-xs">
            {localVariants.length > 0 && (
              <Popover>
                <PopoverTrigger>
                  <Badge
                    color="emerald"
                    className="border rounded-full transition-opacity hover:opacity-80 cursor-pointer"
                  >
                    {localVariants.length}
                  </Badge>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">New Variants</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {localVariants.map((variant) => (
                        <div key={variant.id}>{variant.title}</div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            {variantsToDelete.length > 0 && (
              <Popover>
                <PopoverTrigger>
                  <Badge
                    color="rose"
                    className="border rounded-full transition-opacity hover:opacity-80 cursor-pointer"
                  >
                    {variantsToDelete.length}
                  </Badge>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Variants to Remove</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {variantsToDelete.map((variant) => (
                        <div key={variant.id}>{variant.title}</div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            {unchangedVariants.length > 0 && (
              <Popover>
                <PopoverTrigger>
                  <Badge
                    className="border rounded-full transition-opacity group-data-[state=inactive]:opacity-50"
                  >
                    {unchangedVariants.length}
                  </Badge>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Unchanged Variants</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {unchangedVariants.map((variant) => (
                        <div key={variant.id}>{variant.title}</div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
          <Button onClick={() => onSaveChanges(localVariants)} size="sm">
            Save Changes
          </Button>
        </div>
      </div>

      {localVariants.length > 0 && (
        <div>
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("new")}
          >
            <h3 className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
              New Variants
            </h3>
            <Badge
              className="py-0 text-[11px] border uppercase font-medium tracking-wide rounded-full flex items-center gap-1"
              color="emerald"
            >
              {localVariants.length}
              {expandedSections.new ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Badge>
          </div>
          {expandedSections.new && (
            <div className="space-y-4 mt-4">
              {localVariants.map((variant) => (
                <PendingVariantCard
                  key={variant.id}
                  variant={variant}
                  regions={regions}
                  onDelete={handleRemoveVariant}
                  onUpdate={handleVariantUpdate}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {variantsToDelete.length > 0 && (
        <div>
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("delete")}
          >
            <h3 className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
              Variants to Remove
            </h3>
            <Badge
              className="py-0 text-[11px] border uppercase font-medium tracking-wide rounded-full flex items-center gap-1"
              color="rose"
            >
              {variantsToDelete.length}
              <ChevronDown
                className={cn(
                  "h-3 w-3",
                  !expandedSections.delete && "rotate-180"
                )}
              />
            </Badge>
          </div>
          {expandedSections.delete && (
            <div className="space-y-4 mt-4">
              {variantsToDelete.map((variant) => (
                <DeleteVariantCard
                  key={variant.id}
                  variant={variant}
                  regions={regions}
                  onKeepVariant={() => onRemoveFromDelete(variant)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {unchangedVariants.length > 0 && (
        <div>
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("unchanged")}
          >
            <h3 className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
              Unchanged Variants
            </h3>
            <Badge className="py-0 text-[11px] border uppercase font-medium tracking-wide rounded-full flex items-center gap-1">
              {unchangedVariants.length}
              {expandedSections.unchanged ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Badge>
          </div>
          {expandedSections.unchanged && (
            <div className="space-y-4 mt-4">
              {unchangedVariants.map((variant) => (
                <div
                  key={variant.id}
                  className="border rounded-lg bg-muted/40 p-4"
                >
                  <div className="flex gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border bg-background">
                      <Package className="h-6 w-6 text-foreground/60" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">{variant.title}</div>
                      <div className="flex flex-wrap gap-2">
                        {variant.productOptionValues?.map((ov, i) => (
                          <Badge
                            key={i}
                            color="zinc"
                            className="uppercase rounded-md border text-[.65rem] py-[.0625rem] px-1.5 font-medium"
                          >
                            <span className="opacity-80 mr-1">
                              {ov.productOption.title}:
                            </span>
                            {ov.value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
