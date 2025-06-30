import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProductByHandle } from "@/features/storefront/lib/data/products" 
import { getRegion } from "@/features/storefront/lib/data/regions" 
import ProductTemplate from "@/features/storefront/modules/products/templates"
import { StoreProduct, StoreRegion } from "@/features/storefront/types/storefront"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

// TODO: Adapt generateStaticParams if needed. Requires fetching all product handles and country codes.
// export async function generateStaticParams() {
//   try {
//     // Need a way to get all country codes (e.g., from regions)
//     // Need a way to get all product handles (e.g., a dedicated function or modified getProductsList)
//     const countryCodes = ["us"] // Placeholder
//     const products = [{ handle: "product-1" }, { handle: "product-2" }] // Placeholder
//
//     if (!countryCodes || !products) {
//       return []
//     }
//
//     return countryCodes
//       .map((countryCode) =>
//         products.map((product) => ({
//           countryCode,
//           handle: product.handle,
//         }))
//       )
//       .flat()
//       .filter((param) => param.handle)
//   } catch (error) {
//     console.error(
//       `Failed to generate static paths for product pages: ${
//         error instanceof Error ? error.message : "Unknown error"
//       }.`
//     )
//     return []
//   }
// }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle, countryCode } = params
  const region: StoreRegion | undefined = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  const { product }: { product: StoreProduct | null } = await getProductByHandle({
    handle,
    regionId: region.id,
  })

  if (!product) {
    notFound()
  }

  return {
    title: `${product.title}`, 
    description: `${product.title}`, // Consider using product.description if available and suitable
    openGraph: {
      title: `${product.title}`, 
      description: `${product.title}`,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export async function ProductPage(props: Props) {
  const params = await props.params
  const { handle, countryCode } = params
  const region: StoreRegion | undefined = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  const { product }: { product: StoreProduct | null } = await getProductByHandle({
    handle,
    regionId: region.id,
  })

  if (!product) {
    notFound()
  }

  return (
    <ProductTemplate
      product={product}
      region={region}
      countryCode={countryCode}
    />
  )
}