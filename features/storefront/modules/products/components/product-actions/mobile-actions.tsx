"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import React, { useMemo, useState } from "react"
import { X, ChevronUp } from "lucide-react"
import { getProductPrice } from "@/features/storefront/lib/util/get-product-price"
import OptionSelect from "./option-select"
import { StoreRegion, StoreProduct } from "@/features/storefront/types/storefront"

type ProductVariantInfo = {
  id: string
  title?: string | null
  inventoryQuantity?: number | null
  allowBackorder?: boolean | null
  productOptionValues?: { id: string; value: string; productOption?: { id: string } | null }[] | null
  prices?: { amount: number; currencyCode: string }[] | null
}

type MobileActionsProps = {
  product: StoreProduct
  region: StoreRegion
  variant?: ProductVariantInfo
  options: Record<string, string | undefined>
  updateOptions: (update: Record<string, string>) => void
  inStock?: boolean
  handleAddToCart: () => void
  isAdding?: boolean
  show: boolean
  optionsDisabled: boolean
}

export default function MobileActions({
  product,
  region,
  variant,
  options,
  updateOptions,
  inStock,
  handleAddToCart,
  isAdding,
  show,
  optionsDisabled,
}: MobileActionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const price = getProductPrice({
    product: product,
    variantId: variant?.id,
    region,
  })

  const selectedPrice = useMemo(() => {
    if (!price) return null
    return price.variantPrice || price.cheapestPrice || null
  }, [price])

  const isSimple = (product.productVariants?.length ?? 0) <= 1

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat(region.locale || "en-US", {
      style: "currency",
      currency,
    }).format(amount / 100)
  }

  return (
    <>
      {/* Dark overlay when panel is open */}
      <div
        className={cn(
          "fixed inset-0 bg-black transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-50 z-[100]" : "opacity-0 pointer-events-none z-[-1]"
        )}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Sliding options panel */}
      <div
        className={cn(
          "fixed left-0 right-0 bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] transition-all duration-300 ease-out lg:hidden",
          isOpen ? "bottom-0 z-[101]" : "-bottom-full z-[-1]"
        )}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-semibold">Select Options</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label="Close options"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Panel content - options (scrollable with max height) */}
        <div className="px-5 py-6 max-h-[50vh] overflow-y-auto">
          <div className="flex flex-col gap-6">
            {(product.productOptions || []).map((option) => (
              <OptionSelect
                key={option.id}
                option={option}
                current={options[option.id]}
                updateOption={updateOptions}
                title={option.title}
                disabled={optionsDisabled}
              />
            ))}
          </div>
        </div>

        {/* Panel footer - add to cart */}
        <div className="px-5 py-4 border-t bg-white">
          <Button
            onClick={async () => {
              await handleAddToCart()
              setIsOpen(false)
            }}
            disabled={!inStock || !variant || !!isAdding}
            className="w-full"
          >
            {isAdding
              ? "Adding..."
              : !variant
              ? "Select variant"
              : !inStock
              ? "Out of stock"
              : "Add to cart"}
          </Button>
        </div>
      </div>

      {/* Fixed bottom bar */}
      <div
        className={cn(
          "fixed left-0 right-0 bottom-0 bg-white border-t z-[99] transition-all duration-300 lg:hidden",
          show ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <div className="px-4 py-3">
          {/* Product title and price */}
          <div className="flex items-center justify-center gap-2 mb-3 text-sm">
            <span className="font-medium truncate max-w-[200px]">{product.title}</span>
            <span className="text-gray-400">—</span>
            {selectedPrice && (
              <span className={cn(selectedPrice.calculatedAmount < selectedPrice.originalAmount && "text-red-600")}>
                {formatPrice(selectedPrice.calculatedAmount, selectedPrice.currencyCode)}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className={cn("grid gap-3", isSimple ? "grid-cols-1" : "grid-cols-2")}>
            {!isSimple && (
              <Button
                variant="outline"
                onClick={() => setIsOpen(!isOpen)}
              >
                <span className="flex items-center justify-between w-full">
                  <span className="truncate">
                    {variant ? Object.values(options).filter(Boolean).join(" / ") : "Select Options"}
                  </span>
                  <ChevronUp
                    className={cn(
                      "w-4 h-4 ml-2 flex-shrink-0 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </span>
              </Button>
            )}
            <Button
              onClick={handleAddToCart}
              disabled={!inStock || !variant || !!isAdding}
            >
              {isAdding
                ? "Adding..."
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
