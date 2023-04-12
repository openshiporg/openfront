import transformProductPreview from "@lib/util/transform-product-preview";
import { useMemo } from "react";

const usePreviews = ({ pages, region }) => {
  const previews = useMemo(() => {
    if (!pages || !region) {
      return [];
    }

    const products = [];

    for (const page of pages) {
      products.push(...page.response.products);
    }

    const transformedProducts = products.map((p) =>
      transformProductPreview(p, region)
    );

    return transformedProducts;
  }, [pages, region]);

  return previews;
};

export default usePreviews;
