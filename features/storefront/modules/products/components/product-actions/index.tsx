"use client";
import { Button } from "@/components/ui/button";
import { isEqual } from "lodash";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useIntersection } from "../../../../lib/hooks/use-in-view";
import { addToCart } from "@/features/storefront/lib/data/cart";
// Removed HttpTypes import
import { getProductPrice } from "@/features/storefront/lib/util/get-product-price";
import Divider from "../../../common/components/divider";
import OptionSelect from "./option-select";
import ProductPrice from "../product-price";
import MobileActions from "./mobile-actions";
import { RiLoader2Fill } from "@remixicon/react";

// Define inline types based on GraphQL schema and component usage

// Corresponds to ProductOptionValue in schema
type ProductOptionValueInfo = {
  id: string;
  value: string;
  productOption?: { // Link back to the option - UPDATED
    id: string;
  } | null;
};

// Corresponds to ProductOption in schema
type ProductOptionInfoForActions = {
  id: string;
  title: string;
  name?: string | null;
  metadata?: Record<string, any>;
  productOptionValues?: ProductOptionValueInfo[];
};

// Corresponds to Price in schema
type PriceInfoForActions = {
    amount: number;
    currencyCode: string;
};

// Corresponds to ProductVariant in schema
type ProductVariantInfoForActions = {
  id: string;
  title?: string | null; // Correct field name from schema
  inventoryQuantity?: number | null; // Correct field name from schema
  allowBackorder?: boolean | null; // Correct field name from schema
  productOptionValues?: ProductOptionValueInfo[] | null; // Correct field name from schema - UPDATED
  prices?: PriceInfoForActions[] | null; // Correct field name from schema
};

// Corresponds to Region in schema
import { StoreRegion } from "@/features/storefront/types/storefront";

type RegionInfoForActions = StoreRegion;

// Corresponds to Product in schema
import { StoreProduct } from "@/features/storefront/types/storefront";

type ProductInfoForActions = StoreProduct;

type ProductActionsProps = {
  product: any; // Override strict types to prioritize JS logic
  region: any;
  disabled?: boolean;
  onVariantChange?: (variant: any) => void;
};

export default function ProductActions({ product, region, disabled, onVariantChange }: ProductActionsProps) {
  const [options, setOptions] = useState<any>({});
  const [isAdding, setIsAdding] = useState(false);

  const params = useParams();
  const countryCode = params?.countryCode as string;

  const variants = product.productVariants;

  const hasOnlyOneVariant = useMemo(() => {
    return variants?.length === 1;
  }, [variants]);

  useEffect(() => {
    const optionObj: any = {};
    for (const option of product.productOptions || []) {
      Object.assign(optionObj, { [option.id]: undefined });
    }
    setOptions(optionObj);
  }, [product]);

  const variantRecord = useMemo(() => {
    const map: any = {};
    for (const variant of variants || []) {
      if (!variant.productOptionValues?.length || !variant.id) continue;
      const temp: any = {};
      for (const optionValue of variant.productOptionValues) {
        if (optionValue.productOption?.id && optionValue.value) {
          temp[optionValue.productOption.id] = optionValue.value;
        }
      }
      map[variant.id] = temp;
    }
    return map;
  }, [variants]);

  const variant = useMemo(() => {
    if (hasOnlyOneVariant && variants?.[0]?.id) {
      return variants[0];
    }
    let variantId: string | undefined;
    for (const key of Object.keys(variantRecord)) {
      if (isEqual(variantRecord[key], options)) {
        variantId = key;
      }
    }
    return variants?.find((v: any) => v.id === variantId);
  }, [options, variantRecord, variants, hasOnlyOneVariant]);

  useEffect(() => {
    onVariantChange?.(variant);
    // Emit custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('variantChange', { detail: variant }));
  }, [variant, onVariantChange]);

  useEffect(() => {
    if (variants?.length === 1 && variants[0].id) {
      setOptions(variantRecord[variants[0].id] || {});
    }
  }, [variants, variantRecord]);

  const updateOptions = (update: any) => {
    setOptions({ ...options, ...update });
  };

  const inStock = useMemo(() => {
    if (!variant) return false;
    if (variant.inventoryQuantity <= 0) return false;
    if (variant.allowBackorder === false) return true;
    return true;
  }, [variant]);

  const actionsRef = useRef<HTMLDivElement>(null);
  const inView = useIntersection(actionsRef, "0px");

  const handleAddToCart = async () => {
    if (!variant?.id) return null;
    setIsAdding(true);
    await addToCart({
      variantId: variant.id,
      quantity: 1,
      countryCode,
    });
    setIsAdding(false);
  };

  const isValidVariant = useMemo(() => {
    if (hasOnlyOneVariant) return true;
    return variants?.some((v: any) => {
      if (!v.productOptionValues?.length) return false;
      const temp: any = {};
      for (const optionValue of v.productOptionValues) {
        if (optionValue.productOption?.id && optionValue.value) {
          temp[optionValue.productOption.id] = optionValue.value;
        }
      }
      return isEqual(temp, options);
    });
  }, [variants, options, hasOnlyOneVariant]);

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <div>
          {variants?.length > 1 && (
            <div className="flex flex-col gap-y-4">
              {(product.productOptions || []).map((option: any) => (
                <div key={option.id}>
                  <OptionSelect
                    option={option}
                    current={options[option.id]}
                    updateOption={updateOptions}
                    title={option.title}
                  />
                </div>
              ))}
              <Divider />
            </div>
          )}
        </div>

        <ProductPrice product={product} variant={variant} region={region} />
        <Button
          onClick={handleAddToCart}
          disabled={isAdding || ((!inStock || !variant || !isValidVariant) && !hasOnlyOneVariant)}
          className="w-full h-10"
        >
          {isAdding && <RiLoader2Fill className="animate-spin" />}
          {!variant && !hasOnlyOneVariant
            ? "Select variant"
            : !inStock
            ? "Out of stock"
            : "Add to cart"}
        </Button>
        <MobileActions
          product={product}
          variant={variant}
          region={region}
          options={options}
          updateOptions={updateOptions}
          inStock={inStock && isValidVariant}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  );
}
