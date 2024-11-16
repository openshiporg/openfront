import { notFound } from "next/navigation";

import ProductTemplate from "@storefront/modules/products/templates";
import {
  getProductByHandle,
  getProductsList,
  retrievePricedProductByHandle,
  retrievePricedProductById,
} from "@storefront/lib/data/products";
import { getRegion, listRegions } from "@storefront/lib/data/regions";

export async function generateStaticParams() {
  const countryCodes = await listRegions().then(({ regions }) =>
    regions?.map((r) => r.countries.map((c) => c.iso2)).flat()
  );

  if (!countryCodes) {
    return null;
  }

  const products = await Promise.all(
    countryCodes.map((countryCode) => {
      return getProductsList({ countryCode });
    })
  ).then((responses) =>
    responses.map(({ response }) => response.products).flat()
  );

  const staticParams = countryCodes
    ?.map((countryCode) =>
      products.map((product) => ({
        countryCode,
        handle: product.handle,
      }))
    )
    .flat();

  return staticParams;
}

export async function generateMetadata({ params }) {
  const { handle } = params;

  const { product } = await getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  return {
    title: `${product.title} | Medusa Store`,
    description: `${product.title}`,
    openGraph: {
      title: `${product.title} | Medusa Store`,
      description: `${product.title}`,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  };
}

const getPricedProductByHandle = async (handle, region) => {
  const { product: pricedProduct } = await retrievePricedProductByHandle({
    handle: handle,
    regionId: region.id,
  });

  if (!pricedProduct || !pricedProduct.id) {
    return null;
  }

  return pricedProduct;
};

export default async function ProductPage({ params }) {
  const region = await getRegion(params.countryCode);

  if (!region) {
    notFound();
  }

  const pricedProduct = await getPricedProductByHandle(params.handle, region);

  if (!pricedProduct) {
    notFound();
  }

  return (
    <ProductTemplate
      product={pricedProduct}
      region={region}
      countryCode={params.countryCode}
    />
  );
}
