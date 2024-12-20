import { notFound } from "next/navigation";

import CategoryTemplate from "@storefront/modules/categories/templates";
import {
  getCategoryByHandle,
  listCategories,
} from "@storefront/lib/data/categories";
import { listRegions } from "@storefront/lib/data/regions";

// export async function generateStaticParams() {
// const product_categories = await listCategories()

// if (!product_categories) {
//   return []
// }

// const countryCodes = await listRegions().then((regions) =>
//   regions?.map((r) => r.countries.map((c) => c.iso_2)).flat())

// const categoryHandles = product_categories.map((category) => category.handle)

// const staticParams = countryCodes
//   ?.map((countryCode) =>
//     categoryHandles.map((handle) => ({
//       countryCode,
//       category: [handle],
//     })))
//   .flat()

// return staticParams
// }

// export async function generateMetadata({ params }) {
//   try {
//     const { product_categories } = await getCategoryByHandle(
//       params.category
//     ).then((product_categories) => product_categories);

//     const title = product_categories
//       .map((category) => category.name)
//       .join(" | ");

//     const description =
//       product_categories[product_categories.length - 1].description ??
//       `${title} category.`;

//     return {
//       title: `${title} | Openfront Store`,
//       description,
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
