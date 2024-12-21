import { notFound } from "next/navigation";

import ProductTemplate from "@storefront/modules/products/templates";
import {
  getProductByHandle,
} from "@storefront/lib/data/products";
import { getRegion, listRegions } from "@storefront/lib/data/regions";

export default async function ProductPage({ params }) {
  const region = await getRegion(params.countryCode);
  const { handle } = params;

  if (!region) {
    notFound();
  }

  const { product } = await getProductByHandle({ handle, regionId: region.id });

  if (!product) {
    notFound();
  }

  return (
    <ProductTemplate
      product={product}
      region={region}
      countryCode={params.countryCode}
    />
  );
}
