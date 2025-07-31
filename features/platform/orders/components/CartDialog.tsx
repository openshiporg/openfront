"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, ShoppingCart, X, Search, PackageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { searchProductsWithVariants } from "../actions";

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

type CartItem = {
  id: string;
  variant: ProductVariant;
  quantity: number;
  unitPrice: number;
  total: number;
};

interface CartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lineItems: CartItem[];
  onLineItemsChange: (lineItems: CartItem[]) => void;
}

export function CartDialog({
  open,
  onOpenChange,
  lineItems,
  onLineItemsChange,
}: CartDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Search products with variants
  const searchProducts = async (search: string) => {
    setIsLoading(true);
    try {
      const result = await searchProductsWithVariants(search, 10);
      
      if (result.success && result.data?.products) {
        // Flatten variants for easier access but keep product reference
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
      } else if (!result.success) {
        console.error("Error searching products:", result.error);
      }
    } catch (error) {
      console.error("Error searching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial products
  useEffect(() => {
    if (open) {
      searchProducts("");
    }
  }, [open]);

  // Debounced search effect
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (open) {
        searchProducts(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm, open]);

  const formatPrice = (variant: ProductVariant) => {
    const price = variant.prices?.[0];
    if (!price) return 0;
    
    const amount = price.calculatedPrice?.calculatedAmount || price.amount;
    return amount / 100;
  };

  const addToCart = (variant: ProductVariant) => {
    const existingItem = lineItems.find(item => item.variant.id === variant.id);
    const unitPrice = formatPrice(variant);
    
    if (existingItem) {
      // Update quantity
      onLineItemsChange(
        lineItems.map(item =>
          item.variant.id === variant.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * unitPrice }
            : item
        )
      );
    } else {
      // Add new item
      const newItem: CartItem = {
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
    onLineItemsChange(
      lineItems.map(item => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + delta;
          if (newQuantity <= 0) return item;
          return {
            ...item,
            quantity: newQuantity,
            total: newQuantity * item.unitPrice
          };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const totalItems = lineItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = lineItems.reduce((sum, item) => sum + item.total, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Group variants by product
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Edit Cart
          </DialogTitle>
          <DialogDescription>
            Search and add products to your order
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-6 flex-1 min-h-0">
          {/* Left side - Product search and list */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Products table */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-muted-foreground">Loading products...</div>
                </div>
              ) : Object.keys(groupedProducts).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <PackageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? 'No products found' : 'No products available'}
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <div className="max-h-[400px] overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50 sticky top-0">
                        <tr>
                          <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Product / Variant
                          </th>
                          <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Price
                          </th>
                          <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            SKU
                          </th>
                          <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.values(groupedProducts).map(({ product, variants }) => (
                          <React.Fragment key={product.id}>
                            {/* Product header row */}
                            <tr className="bg-muted/20 border-t">
                              <td colSpan={4} className="p-3">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                    {product.thumbnail ? (
                                      <img
                                        src={product.thumbnail}
                                        alt={product.title}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <PackageIcon className="h-5 w-5 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <h3 className="font-medium text-sm">{product.title}</h3>
                                    <p className="text-xs text-muted-foreground">
                                      {variants.length} variant{variants.length !== 1 ? 's' : ''}
                                    </p>
                                  </div>
                                </div>
                              </td>
                            </tr>
                            {/* Variant rows */}
                            {variants.map((variant) => {
                              const price = formatPrice(variant);
                              return (
                                <motion.tr
                                  key={variant.id}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="border-t hover:bg-accent/30 cursor-pointer"
                                  onClick={() => addToCart(variant)}
                                >
                                  <td className="p-3">
                                    <div className="pl-6">
                                      <span className="text-sm">{variant.title}</span>
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <span className="text-sm font-medium">
                                      {formatCurrency(price)}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <span className="text-xs text-muted-foreground">
                                      {variant.sku || '—'}
                                    </span>
                                  </td>
                                  <td className="p-3 text-right">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addToCart(variant);
                                      }}
                                      className="h-7 px-2 text-xs"
                                    >
                                      <Plus className="w-3 h-3 mr-1" />
                                      Add
                                    </Button>
                                  </td>
                                </motion.tr>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Cart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "w-80 flex flex-col border rounded-xl p-4 bg-card"
            )}
          >
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-medium">
                Cart ({totalItems})
              </h2>
            </div>

            <motion.div className="flex-1 overflow-y-auto min-h-0 space-y-3">
              <AnimatePresence initial={false} mode="popLayout">
                {lineItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{
                      opacity: { duration: 0.2 },
                      layout: { duration: 0.2 },
                    }}
                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">
                          {item.variant.product.title}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 rounded-md hover:bg-muted"
                        >
                          <X className="w-3 h-3 text-muted-foreground" />
                        </motion.button>
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {item.variant.title}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 rounded-md hover:bg-muted"
                          >
                            <Minus className="w-3 h-3" />
                          </motion.button>
                          <motion.span
                            layout
                            className="text-xs w-4 text-center"
                          >
                            {item.quantity}
                          </motion.span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 rounded-md hover:bg-muted"
                          >
                            <Plus className="w-3 h-3" />
                          </motion.button>
                        </div>
                        <motion.span
                          layout
                          className="text-xs text-muted-foreground"
                        >
                          {formatCurrency(item.total)}
                        </motion.span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            <motion.div
              layout
              className="pt-3 mt-3 border-t"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Total</span>
                <motion.span
                  layout
                  className="text-sm font-semibold"
                >
                  $<NumberFlow value={totalPrice} />
                </motion.span>
              </div>
              <Button 
                onClick={() => onOpenChange(false)} 
                className="w-full"
                size="sm"
              >
                Done
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}