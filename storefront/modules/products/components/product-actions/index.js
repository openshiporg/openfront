"use client";
import { Button } from "@medusajs/ui";
import { isEqual } from "lodash";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useIntersection } from "@storefront/lib/hooks/use-in-view";
import { addToCart } from "@storefront/lib/data/cart";
import Divider from "@storefront/modules/common/components/divider";
import OptionSelect from "@storefront/modules/products/components/option-select";

import MobileActions from "../mobile-actions";
import ProductPrice from "../product-price";

export default function ProductActions({ product, region }) {
  const [options, setOptions] = useState({});
  const [isAdding, setIsAdding] = useState(false);

  const countryCode = useParams().countryCode;

  const variants = product.productVariants;

  // initialize the option state
  useEffect(() => {
    const optionObj = {};

    for (const option of product.productOptions || []) {
      Object.assign(optionObj, { [option.id]: undefined });
    }

    setOptions(optionObj);
  }, [product]);

  // memoized record of the product's variants
  const variantRecord = useMemo(() => {
    const map = {};

    for (const variant of variants) {
      if (!variant.productOptionValues?.length || !variant.id) continue;

      const temp = {};
      
      // Map option values using productOptionValues relationship
      for (const optionValue of variant.productOptionValues) {
        temp[optionValue.productOption.id] = optionValue.value;
      }

      map[variant.id] = temp;
    }

    return map;
  }, [variants]);

  // memoized function to check if the current options are a valid variant
  const variant = useMemo(() => {
    let variantId = undefined;

    for (const key of Object.keys(variantRecord)) {
      if (isEqual(variantRecord[key], options)) {
        variantId = key;
      }
    }

    return variants.find((v) => v.id === variantId);
  }, [options, variantRecord, variants]);

  // if product only has one variant, then select it
  useEffect(() => {
    if (variants.length === 1 && variants[0].id) {
      setOptions(variantRecord[variants[0].id] || {});
    }
  }, [variants, variantRecord]);

  // update the options when a variant is selected
  const updateOptions = (update) => {
    setOptions({ ...options, ...update });
  };

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    if (!variant) return false;

    if (variant.inventoryQuantity <= 0) {
      return false;
    }

    if (variant.allowBackorder === false) {
      return true;
    }

    return true;
  }, [variant]);

  const actionsRef = useRef(null);

  const inView = useIntersection(actionsRef, "0px");

  // add the selected variant to the cart
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

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <div>
          {product.productVariants.length > 1 && (
            <div className="flex flex-col gap-y-4">
              {(product.productOptions).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={updateOptions}
                      title={option.title}
                    />
                  </div>
                );
              })}
              <Divider />
            </div>
          )}
        </div>

        <ProductPrice product={product} variant={variant} region={region} />
        <Button
          onClick={handleAddToCart}
          disabled={!inStock || !variant}
          variant="primary"
          className="w-full h-10"
          isLoading={isAdding}
        >
          {!variant
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
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
        />
      </div>
    </>
  );
}
