"use server";
import { notFound } from "next/navigation";

import {
  getProductByHandle,
  getProductsList,
  getRegion,
  listRegions,
  retrievePricedProductById,
} from "@storefront/lib/data";
import ProductTemplate from "@storefront/modules/products/templates";

export default async function ProductPage({ params }) {
  // const region = await getRegion(params.countryCode);

  // if (!region) {
  //   notFound();
  // }

  // const pricedProduct = await getPricedProductByHandle(params.handle, region);

  // if (!pricedProduct) {
  //   notFound();
  // }

  // return (
  //   <ProductTemplate
  //     product={pricedProduct}
  //     region={region}
  //     countryCode={params.countryCode}
  //   />
  // );
  // notFound();
  return <div>hello</div>;
}
