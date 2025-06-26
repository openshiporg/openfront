"use client";

import { useId, useState, useEffect } from "react";
import { CheckIcon, ChevronDownIcon, PackageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { searchProductVariants } from "../actions";

type ProductVariant = {
  id: string;
  title: string;
  sku?: string;
  product: {
    id: string;
    title: string;
    thumbnail?: string;
  };
  prices: {
    id: string;
    amount: number;
    currency: { code: string };
    calculatedPrice: {
      calculatedAmount: number;
      originalAmount: number;
      currencyCode: string;
    };
  }[];
  inventory?: {
    quantity: number;
  };
};

interface VariantSearchComboboxProps {
  value?: string;
  onValueChange: (variantId: string | null) => void;
  selectedVariant?: ProductVariant | null;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function VariantSearchCombobox({
  value,
  onValueChange,
  selectedVariant,
  label = "Select Product Variant",
  placeholder = "Search products and variants...",
  className,
}: VariantSearchComboboxProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search function
  const searchVariants = async (search: string) => {
    setIsLoading(true);
    try {
      const result = await searchProductVariants(search, 50);
      
      if (result.success && result.data?.productVariants) {
        setVariants(result.data.productVariants);
      } else if (!result.success) {
        console.error("Error searching variants:", result.error);
      }
    } catch (error) {
      console.error("Error searching variants:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial variants
  useEffect(() => {
    searchVariants("");
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeout = setTimeout(() => {
      searchVariants(searchTerm);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const handleSelect = (variantId: string) => {
    onValueChange(variantId === value ? null : variantId);
    setOpen(false);
  };

  const formatPrice = (variant: ProductVariant) => {
    const price = variant.prices?.[0];
    if (!price) return "Price not available";
    
    const amount = price.calculatedPrice?.calculatedAmount || price.amount;
    const currency = price.calculatedPrice?.currencyCode || price.currency?.code || "USD";
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  };

  const getInventoryStatus = (variant: ProductVariant) => {
    const quantity = variant.inventory?.quantity;
    if (quantity === undefined || quantity === null) return { text: "No stock info", color: "gray" };
    if (quantity === 0) return { text: "Out of stock", color: "red" };
    if (quantity < 10) return { text: `${quantity} left`, color: "yellow" };
    return { text: "In stock", color: "green" };
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px] h-auto py-2"
          >
            <span className={cn("truncate", !selectedVariant && "text-muted-foreground")}>
              {selectedVariant ? (
                <div className="flex items-center gap-2 text-left">
                  {selectedVariant.product.thumbnail ? (
                    <img
                      src={selectedVariant.product.thumbnail}
                      alt={selectedVariant.product.title}
                      className="w-8 h-8 rounded object-cover"
                    />
                  ) : (
                    <PackageIcon size={16} className="text-muted-foreground" />
                  )}
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-medium truncate">
                      {selectedVariant.product.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {selectedVariant.title}
                      </span>
                      <span className="text-sm font-medium">
                        {formatPrice(selectedVariant)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                "Select product variant"
              )}
            </span>
            <ChevronDownIcon
              size={16}
              className="text-muted-foreground/80 shrink-0"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput 
              placeholder={placeholder}
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading variants...
                </div>
              ) : (
                <>
                  <CommandEmpty>No variants found.</CommandEmpty>
                  <CommandGroup>
                    {variants.map((variant) => {
                      const inventoryStatus = getInventoryStatus(variant);
                      return (
                        <CommandItem
                          key={variant.id}
                          value={variant.id}
                          onSelect={handleSelect}
                          className="py-3"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {variant.product.thumbnail ? (
                                <img
                                  src={variant.product.thumbnail}
                                  alt={variant.product.title}
                                  className="w-10 h-10 rounded object-cover shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center shrink-0">
                                  <PackageIcon size={16} className="text-muted-foreground" />
                                </div>
                              )}
                              <div className="flex flex-col gap-1 min-w-0">
                                <div className="font-medium truncate">
                                  {variant.product.title}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {variant.title}
                                </div>
                                {variant.sku && (
                                  <div className="text-xs text-muted-foreground">
                                    SKU: {variant.sku}
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {formatPrice(variant)}
                                  </span>
                                  <Badge 
                                    variant="outline" 
                                    className={cn(
                                      "text-xs",
                                      inventoryStatus.color === "green" && "border-green-200 text-green-700",
                                      inventoryStatus.color === "yellow" && "border-yellow-200 text-yellow-700",
                                      inventoryStatus.color === "red" && "border-red-200 text-red-700",
                                      inventoryStatus.color === "gray" && "border-gray-200 text-gray-700"
                                    )}
                                  >
                                    {inventoryStatus.text}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            {value === variant.id && (
                              <CheckIcon size={16} className="text-primary shrink-0" />
                            )}
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}