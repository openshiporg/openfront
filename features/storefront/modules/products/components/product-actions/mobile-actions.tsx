import { Button } from "@/components/ui/button" 
import { cn } from "@/lib/utils" 
import React, { Fragment, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"

import useToggleState from "@/features/storefront/lib/hooks/use-toggle-state"
import ChevronDown from "@/features/storefront/modules/common/icons/chevron-down"
import X from "@/features/storefront/modules/common/icons/x"

import { getProductPrice } from "@/features/storefront/lib/util/get-product-price"
import OptionSelect from "./option-select"
// Removed HttpTypes import
import { isSimpleProduct } from "@/features/storefront/lib/util/product"

// Define inline types matching those used in ProductActions
type ProductOptionValueInfo = {
  id: string;
  value: string;
  productOption?: { // Link back to the option - CONSISTENT WITH ProductActions
    id: string;
  } | null;
};

type ProductOptionInfoForActions = {
  id: string;
  title: string;
  name?: string | null;
  metadata?: Record<string, any>;
  productOptionValues?: ProductOptionValueInfo[];
};

type ProductVariantInfoForActions = {
  id: string;
  title?: string | null; // Correct field name from schema
  inventoryQuantity?: number | null; // Correct field name from schema (camelCase)
  allowBackorder?: boolean | null; // Correct field name from schema (camelCase)
  productOptionValues?: ProductOptionValueInfo[] | null; // Correct field name from schema - CONSISTENT
  prices?: { amount: number; currencyCode: string }[] | null;
};

import { StoreRegion } from "@/features/storefront/types/storefront";

type RegionInfoForActions = StoreRegion;

import { StoreProduct } from "@/features/storefront/types/storefront";

type ProductInfoForActions = StoreProduct;

type MobileActionsProps = {
  product: ProductInfoForActions; // Use updated type
  region: RegionInfoForActions; // Use updated type
  variant?: ProductVariantInfoForActions; // Use updated type
  options: Record<string, string | undefined>;
  updateOptions: (optionId: string, value: string) => void; // Changed first arg name to match usage
  inStock?: boolean;
  handleAddToCart: () => void;
  isAdding?: boolean;
  show: boolean;
  optionsDisabled: boolean;
};

const MobileActions: React.FC<MobileActionsProps> = ({
  product,
  region, // Destructure region prop
  variant,
  options,
  updateOptions,
  inStock,
  handleAddToCart,
  isAdding,
  show,
  optionsDisabled,
}) => {
  const [optionsDialogOpen, setOptionsDialogOpen] = useState(false)

  const price = getProductPrice({
    product: product,
    variantId: variant?.id,
    region,
  });

  const selectedPrice = useMemo(() => {
    if (!price) {
      return null
    }
    const { variantPrice, cheapestPrice } = price

    return variantPrice || cheapestPrice || null
  }, [price])

  // Replicate isSimpleProduct logic locally to match ProductInfoForActions type
  const isSimple = useMemo(() => (product.productVariants?.length ?? 0) <= 1, [product.productVariants]); // Use productVariants and handle null/0 cases

  return (
    <>
      {/* Bottom action bar */}
      <div
        className={cn("z-10 lg:hidden inset-x-0 bottom-0 fixed transition-opacity duration-300", { 
          "opacity-0 pointer-events-none": !show,
          "opacity-100": show,
        })}
      >
        <div
          className="bg-background flex flex-col gap-y-3 justify-center items-center text-base leading-6 font-normal p-4 h-full w-full border-t"
          data-testid="mobile-actions"
        >
          <div className="flex items-center gap-x-2">
            <span data-testid="mobile-title">{product.title}</span>
            <span>—</span>
            {selectedPrice ? (
              <div className="flex items-end gap-x-2 text-foreground">
                {selectedPrice.calculatedAmount < selectedPrice.originalAmount && (
                  <p>
                    <span className="line-through text-xs leading-5 font-normal">
                      {new Intl.NumberFormat(region.locale || 'en-US', {
                        style: 'currency',
                        currency: selectedPrice.currencyCode,
                      }).format(selectedPrice.originalAmount / 100)}
                    </span>
                  </p>
                )}
                <span
                  className={cn({
                    "text-primary": selectedPrice.calculatedAmount < selectedPrice.originalAmount,
                  })}
                >
                  {new Intl.NumberFormat(region.locale || 'en-US', {
                    style: 'currency',
                    currency: selectedPrice.currencyCode,
                  }).format(selectedPrice.calculatedAmount / 100)}
                </span>
              </div>
            ) : (
              <div></div>
            )}
          </div>
          <div className={cn("grid grid-cols-2 w-full gap-x-4", { 
            "!grid-cols-1": isSimple
          })}>
            {!isSimple && (
              <Dialog open={optionsDialogOpen} onOpenChange={setOptionsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline" // Use Shadcn outline variant
                    className="w-full"
                    data-testid="mobile-actions-button"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>
                        {variant
                          ? Object.values(options).join(" / ")
                          : "Select Options"}
                      </span>
                      <ChevronDown />
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent 
                  className="w-full h-screen max-w-none rounded-none p-0 gap-0"
                  data-testid="mobile-actions-modal"
                >
                  <div className="w-full flex justify-end pr-6 pt-6">
                    <button
                      onClick={() => setOptionsDialogOpen(false)}
                      className="bg-background w-12 h-12 rounded-full text-foreground flex justify-center items-center border"
                      data-testid="close-modal-button"
                    >
                      <X />
                    </button>
                  </div>
                  <div className="bg-background px-6 py-12 flex-1">
                    {(product.productVariants?.length ?? 0) > 1 && ( // Use productVariants
                      <div className="flex flex-col gap-y-6">
                        {(product.productOptions || []).map((option) => { // Use productOptions
                          return (
                            <div key={option.id}>
                              <OptionSelect
                                option={option}
                                current={options[option.id]}
                                updateOption={(value) => updateOptions(option.id, value)}
                                title={option.title}
                                disabled={optionsDisabled}
                              />
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <Button
              onClick={handleAddToCart}
              disabled={!inStock || !variant || !!isAdding} // Combine disabled logic
              className="w-full"
              data-testid="mobile-cart-button"
            >
              {isAdding
                ? "Adding..." // Indicate loading state
                : !variant
                  ? "Select variant"
                  : !inStock
                    ? "Out of stock"
                    : "Add to cart"}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default MobileActions
