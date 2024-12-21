import { notFound } from "next/navigation";

import ProductTemplate from "@storefront/modules/products/templates";
import {
  getProductByHandle,
  getProductsList,
  retrievePricedProductByHandle,
  retrievePricedProductById,
} from "@storefront/lib/data/products";
import { getRegion, listRegions } from "@storefront/lib/data/regions";
import { gql } from "graphql-tag";
import { openfrontClient } from "@storefront/lib/config";

// export async function generateStaticParams() {
//   if (process.env.ENABLE_SSG !== 'true') {
//     return [];
//   }
//   try {
//     const GET_ALL_PRODUCTS_HANDLES = gql`
//       query GetAllProductHandles {
//         products {
//           handle
//         }
//       }
//     `;

//     const countryCodes = await listRegions().then(({ regions }) =>
//       regions?.map((r) => r.countries.map((c) => c.iso2)).flat()
//     );

//     if (!countryCodes) {
//       return [];
//     }

//     const { products } = await openfrontClient.request(GET_ALL_PRODUCTS_HANDLES, {}, {
//       next: { tags: ["products"] }
//     });

//     return countryCodes
//       .map((countryCode) =>
//         products.map((product) => ({
//           countryCode,
//           handle: product.handle,
//         }))
//       )
//       .flat()
//       .filter((param) => param.handle);
//   } catch (error) {
//     console.error(
//       `Failed to generate static paths for product pages: ${
//         error instanceof Error ? error.message : "Unknown error"
//       }.`
//     );
//     return [];
//   }
// }

// export async function generateMetadata({ params }) {
//   const region = await getRegion(params.countryCode);
  
//   if (!region) {
//     notFound();
//   }

//   const { product } = await getProductByHandle({ 
//     handle: params.handle,
//     regionId: region.id 
//   });

//   if (!product) {
//     notFound();
//   }

//   return {
//     title: `${product.title} | Openfront Store`,
//     description: product.description || `${product.title} product`,
//     alternates: {
//       canonical: `products/${params.handle}`,
//     },
//   };
// }

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
