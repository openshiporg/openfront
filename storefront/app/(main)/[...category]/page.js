import { getCategoryByHandle } from "@lib/data"
import CategoryTemplate from "@modules/categories/templates"
import { notFound } from "next/navigation"

export async function generateMetadata(
  {
    params
  }
) {
  const { product_categories } = await getCategoryByHandle(params.category).catch((err) => {
    notFound()
  })

  const category = product_categories[0]

  return {
    title: `${category.name} | Acme Store`,
    description: `${category.name} category`,
  }
}

export default async function CategoryPage({
  params
}) {
  const { product_categories } = await getCategoryByHandle(params.category).catch((err) => {
    notFound()
  })

  return <CategoryTemplate categories={product_categories} />;
}
