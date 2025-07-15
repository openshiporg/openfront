"use client";

import React from "react";
import { VariantsContent } from "./VariantsContent";

interface ProductSectionTabsProps {
  product: any;
}

export const ProductSectionTabs = ({ product }: ProductSectionTabsProps) => {
  // Calculate counts for sections
  const variantsCount = product.productVariants?.length || 0;
  const categoriesCount = product.productCategories?.length || 0;
  const collectionsCount = product.productCollections?.length || 0;

  return (
    <div className="space-y-0">
      {/* Show tabs if there are variants and/or organization data */}
      {(variantsCount > 0 || categoriesCount > 0 || collectionsCount > 0) && (
        <VariantsContent
          productId={product.id}
          variants={product.productVariants || []}
          categories={product.productCategories || []}
          collections={product.productCollections || []}
        />
      )}
    </div>
  );
};