import { getProductByHandle } from "@lib/data"
import ProductTemplate from "@modules/products/templates"
import { notFound } from "next/navigation"

export async function generateMetadata(
  {
    params
  }
) {
  const data = await getProductByHandle(params.handle)

  const product = data.products[0]

  if (!product) {
    notFound()
  }

  return {
    title: `${product.title} | Acme Store`,
    description: `${product.title}`,
    openGraph: {
      title: `${product.title} | Acme Store`,
      description: `${product.title}`,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage({
  params
}) {
  const { products } = await getProductByHandle(params.handle).catch((err) => {
    notFound()
  })

  return <ProductTemplate product={products[0]} />;
}
