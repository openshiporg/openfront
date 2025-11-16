import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProductByHandle } from "@/features/storefront/lib/data/products"
import { getRegion } from "@/features/storefront/lib/data/regions"
import ProductTemplate from "@/features/storefront/modules/products/templates"
import { StoreProduct, StoreRegion } from "@/features/storefront/types/storefront"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

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
    description: `${product.title}`,
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
