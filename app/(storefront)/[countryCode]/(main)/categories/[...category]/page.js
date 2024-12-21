import { notFound } from "next/navigation";

import CategoryTemplate from "@storefront/modules/categories/templates";
import {
  getCategoryByHandle,
  listCategories,
} from "@storefront/lib/data/categories";
import { listRegions } from "@storefront/lib/data/regions";

// export async function generateStaticParams() {
//   if (process.env.ENABLE_SSG !== 'true') {
//     return [];
//   }

//   const product_categories = await listCategories()

//   if (!product_categories) {
//     return []
//   }

//   const countryCodes = await listRegions().then((regions) =>
//     regions?.map((r) => r.countries.map((c) => c.iso_2)).flat())

//   const categoryHandles = product_categories.map((category) => category.handle)

//   const staticParams = countryCodes
//     ?.map((countryCode) =>
//       categoryHandles.map((handle) => ({
//         countryCode,
//         category: [handle],
//       })))
//     .flat()

//   return staticParams
// }

// export async function generateMetadata({ params }) {
//   try {
//     const { productCategory } = await getCategoryByHandle(params.category);
    
//     if (!productCategory) {
//       notFound();
//     }

//     return {
//       title: `${productCategory.title} | Openfront Store`,
//       description: productCategory.description || `${productCategory.title} category`,
//       alternates: {
//         canonical: `${params.category.join("/")}`,
//       },
//     };
//   } catch (error) {
//     notFound();
//   }
// }

export default async function CategoryPage({ params, searchParams }) {
  const { sortBy, page } = searchParams;

  const { product_categories } = await getCategoryByHandle(
    params.category
  ).then((product_categories) => product_categories);

  if (!product_categories) {
    notFound();
  }

  return (
    <CategoryTemplate
      categories={product_categories}
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
    />
  );
}
