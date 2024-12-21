import { notFound } from "next/navigation";

import CategoryTemplate from "@storefront/modules/categories/templates";
import { getCategoryByHandle } from "@storefront/lib/data/categories";
import { getRegion } from "@storefront/lib/data/regions";

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
