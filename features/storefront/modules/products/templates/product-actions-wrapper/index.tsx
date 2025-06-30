import { retrievePricedProductByHandle } from "../../../../lib/data/products"
import ProductActions from "../../components/product-actions"

/**
 * Fetches real time pricing for a product and renders the product actions component.
 */
export default async function ProductActionsWrapper({
  handle,
  region,
}: {
  handle: string
  region: any
}) {
  const { product } = await retrievePricedProductByHandle({ handle, regionId: region.id })

  if (!product) {
    return null
  }

  return <ProductActions product={product} region={region} />
}
