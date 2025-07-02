"use client";

import React from "react";
import { VariantsContent } from "./VariantsContent";

interface ProductSectionTabsProps {
  product: any;
}

export const ProductSectionTabs = ({ product }: ProductSectionTabsProps) => {
  // Calculate counts for sections
  const variantsCount = product.productVariants?.length || 0;

  return (
    <div className="space-y-0">
      {/* Variants Section - Always show if there are variants */}
      {variantsCount > 0 && (
        <VariantsContent
          productId={product.id}
          totalItems={variantsCount}
          variants={product.productVariants || []}
        />
      )}
      
      {/* Organization Section */}
      {(product.productCategories?.length || product.productCollections?.length) && (
        <div className="px-4 md:px-6 py-4 border-b">
          <h4 className="text-sm font-medium mb-3">Organization</h4>
          <div className="flex flex-wrap gap-2">
            {product.productCategories?.map((category: any) => (
              <span
                key={category.id}
                className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold text-foreground"
              >
                {category.title}
              </span>
            ))}
            {product.productCollections?.map((collection: any) => (
              <span
                key={collection.id}
                className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold text-muted-foreground border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              >
                {collection.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Product Settings */}
      <div className="px-4 md:px-6 py-4">
        <h4 className="text-sm font-medium mb-3">Product Settings</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Discountable:</span>
            <span className="ml-2 font-medium">
              {product.discountable ? "Yes" : "No"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Gift Card:</span>
            <span className="ml-2 font-medium">
              {product.isGiftcard ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};