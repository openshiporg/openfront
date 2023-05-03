import ProductActions from "@modules/products/components/product-actions";
import React from "react";

const ProductInfo = ({ product }) => {
  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-12 lg:max-w-[500px] mx-auto">
        <div>
          <ProductActions product={product} />
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
