"use client";

import { useState, useEffect } from "react";
import { PackageIcon, Plus, Minus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { searchProductsWithVariants } from "../actions";
import { motion, AnimatePresence } from "framer-motion";

const Card = "div";

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
};

type LineItem = {
  id: string;
  variant: ProductVariant;
  quantity: number;
  unitPrice: number;
  total: number;
};

interface LineItemsManagerProps {
  lineItems: LineItem[];
  onLineItemsChange: (lineItems: LineItem[]) => void;
  className?: string;
}

export function LineItemsManager({
  lineItems,
  onLineItemsChange,
  className,
}: LineItemsManagerProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Search logic from CartDialog
  const searchProducts = async (search: string) => {
    setIsLoading(true);
    try {
      const result = await searchProductsWithVariants(search, 10);
      
      if (result.success && result.data?.products) {
        const allVariants: ProductVariant[] = [];
        result.data.products.forEach((product: any) => {
          product.productVariants.forEach((variant: any) => {
            allVariants.push({
              ...variant,
              product: {
                id: product.id,
                title: product.title,
                thumbnail: product.thumbnail
              }
            });
          });
        });
        setVariants(allVariants);
      }
    } catch (error) {
      console.error("Error searching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      searchProducts("");
    }
  }, [open]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (open) {
        searchProducts(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm, open]);

  const formatPriceVal = (variant: ProductVariant) => {
    const price = variant.prices?.[0];
    if (!price) return 0;
    const amount = price.calculatedPrice?.calculatedAmount || price.amount;
    return amount / 100;
  };

  const addToCart = (variant: ProductVariant) => {
    const existingItem = lineItems.find(item => item.variant.id === variant.id);
    const unitPrice = formatPriceVal(variant);
    
    if (existingItem) {
      onLineItemsChange(
        lineItems.map(item =>
          item.variant.id === variant.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * unitPrice }
            : item
        )
      );
    } else {
      const newItem: LineItem = {
        id: `item-${Date.now()}-${variant.id}`,
        variant,
        quantity: 1,
        unitPrice,
        total: unitPrice,
      };
      onLineItemsChange([...lineItems, newItem]);
    }
  };

  const removeFromCart = (itemId: string) => {
    onLineItemsChange(lineItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    const nextItems = lineItems.flatMap((item) => {
      if (item.id !== itemId) return [item];

      const newQuantity = item.quantity + delta;
      if (newQuantity <= 0) return [];

      return [{
        ...item,
        quantity: newQuantity,
        total: newQuantity * item.unitPrice,
      }];
    });

    onLineItemsChange(nextItems);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  const groupedProducts = variants.reduce((acc, variant) => {
    const productId = variant.product.id;
    if (!acc[productId]) {
      acc[productId] = {
        product: variant.product,
        variants: []
      };
    }
    acc[productId].variants.push(variant);
    return acc;
  }, {} as Record<string, { product: any; variants: ProductVariant[] }>);

  return (
    <Card className={cn("relative rounded-xl border border-transparent bg-card shadow ring-1 ring-foreground/5 dark:ring-white/10 overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between p-0 border-b bg-muted/40">
        <CardTitle className="px-4 py-3 mb-0 font-medium uppercase text-xs tracking-wider text-muted-foreground">
          Line Items
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Search Bar Inline */}
        <div className="p-4 border-b bg-muted/10">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-start gap-2 text-left text-muted-foreground bg-background hover:bg-background border-input font-normal"
              >
                <Search className="h-4 w-4 text-muted-foreground opacity-70" />
                <span className="truncate">Search products or variants to add...</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] p-0"
              align="start"
            >
              <Command shouldFilter={false}>
                <CommandInput 
                  placeholder="Search products..."
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                />
                <CommandList className="max-h-[300px] overflow-y-auto w-full">
                  {isLoading ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      Searching...
                    </div>
                  ) : Object.keys(groupedProducts).length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                       <PackageIcon className="h-8 w-8 opacity-20" />
                       No products found.
                    </div>
                  ) : (
                    Object.values(groupedProducts).map(({ product, variants: prodVariants }) => (
                      <CommandGroup key={product.id} heading={product.title} className="text-foreground border-t first:border-t-0 p-1">
                        {prodVariants.map((variant) => {
                          const unitPrice = formatPriceVal(variant);
                          const existingQty = lineItems.find(i => i.variant.id === variant.id)?.quantity || 0;
                          return (
                            <CommandItem
                              key={variant.id}
                              value={variant.id}
                              onSelect={() => {
                                addToCart(variant);
                                // don't close so they can keep adding
                              }}
                              className="flex items-center justify-between py-2 cursor-pointer w-full"
                            >
                              <div className="flex flex-col gap-0.5 max-w-[70%]">
                                <span className="font-medium text-sm truncate">{variant.title}</span>
                                {variant.sku && <span className="text-xs text-muted-foreground">{variant.sku}</span>}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium">{formatPrice(unitPrice)}</span>
                                {existingQty > 0 ? (
                                  <div className="flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-full w-6 h-6 text-xs font-bold ring-1 ring-inset ring-indigo-600/20">
                                    {existingQty}
                                  </div>
                                ) : (
                                  <Plus className="h-4 w-4 text-muted-foreground opacity-50" />
                                )}
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    ))
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Existing Items */}
        <div className="divide-y relative">
          {lineItems.length === 0 ? (
            <div className="px-10 py-16 text-center text-muted-foreground flex flex-col items-center">
              <PackageIcon className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm font-medium text-foreground/80">No items added</p>
              <p className="text-xs mt-1 max-w-[200px] leading-relaxed">Search for products above to start building the order.</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {lineItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="h-12 w-12 bg-muted/30 border border-border/50 rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {item.variant.product.thumbnail ? (
                        <img
                          src={item.variant.product.thumbnail}
                          alt={item.variant.product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <PackageIcon size={16} className="text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col">
                      <span className="font-medium text-sm truncate text-foreground pr-4">
                        {item.variant.product.title}
                      </span>
                      {item.variant.title && (
                        <span className="text-xs text-muted-foreground truncate flex items-center gap-2 mt-0.5">
                          {item.variant.title} {item.variant.sku ? <span className="opacity-60">• {item.variant.sku}</span> : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 self-end sm:self-auto pl-16 sm:pl-0">
                    {/* Quantity Control */}
                    <div className="flex items-center gap-1 border border-border/60 rounded-lg p-0.5 bg-background shadow-sm hover:border-border transition-colors">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Minus className="size-3" strokeWidth={3} />
                      </button>
                      <span className="text-xs font-semibold w-7 text-center text-foreground tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Plus className="size-3" strokeWidth={3} />
                      </button>
                    </div>

                    <div className="flex flex-col items-end min-w-[70px]">
                      <span className="text-sm font-semibold tabular-nums text-foreground">
                        {formatPrice(item.total)}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                          {formatPrice(item.unitPrice)} ea
                        </span>
                      )}
                    </div>

                    <div className="w-8 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                        title="Remove item"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Subtotal */}
        {lineItems.length > 0 && (
          <div className="border-t bg-muted/5 p-4 py-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold uppercase tracking-wider text-muted-foreground text-[11px]">Total Selected</span>
              <span className="font-semibold text-base tabular-nums">{formatPrice(getSubtotal())}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}