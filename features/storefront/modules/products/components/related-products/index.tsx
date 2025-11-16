import { getProductsList } from "../../../../lib/data/products"
import { getRegion } from "../../../../lib/data/regions"
import ProductPreview from "../product-preview"
// Define ProductPreviewType locally since product-preview doesn't export it
type ProductPreviewType = {
  id: string;
  handle: string;
  title: string;
  thumbnail: string;
}
import { StoreRegion } from "@/features/storefront/types/storefront"

// Define inline types based on schema assumptions
type CollectionInfo = {
  id: string;
  // Add other fields if needed
};

type TagInfo = {
  id: string;
  // Add other fields if needed
};

type ProductForRelated = {
  id: string;
  productCollections?: CollectionInfo[] | null; // Corrected name
  tags?: TagInfo[] | null;
};

// Define type for queryParams based on usage
type ProductListQueryParams = {
  collections?: string[];
  tags?: string[];
  isGiftCard?: boolean;
  // Add other potential query params if known
};

type RelatedProductsProps = {
  product: ProductForRelated; // Use defined type
  countryCode: string;
};

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region: StoreRegion | null = await getRegion(countryCode) // Add type for region

  if (!region) {
    return null
  }

  // Define query parameters for related products
  const queryParams: ProductListQueryParams = {} // Use defined type

  // Add collection filter if product has collections
  if (product.productCollections && product.productCollections.length > 0) {
    queryParams.collections = product.productCollections.map((c: CollectionInfo) => c.id) // Use CollectionInfo type
  }

  // Add tag filter if product has tags
  if (product.tags && product.tags.length > 0) {
    queryParams.tags = product.tags.map((t: TagInfo) => t.id) // Use TagInfo type
  }

  // Exclude gift cards
  queryParams.isGiftCard = false

  const { response: { products } } = await getProductsList({ queryParams, countryCode })

  // Filter out the current product from the fetched list
  // Assuming products returned by getProductsList match ProductPreviewType structure
  const filteredProducts = products.filter(
    (responseProduct: ProductPreviewType) => responseProduct.id !== product.id // Use ProductPreviewType
  )

  if (!filteredProducts.length) {
    return null
  }

  return (
    <div className="product-page-constraint">
      <div className="flex flex-col items-center text-center mb-16">
        <span className="text-sm leading-6 font-normal text-gray-600 mb-6">
          Related products
        </span>
        <p className="text-3xl font-medium text-foreground max-w-lg">
          You might also want to check out these products.
        </p>
      </div>

      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
        {filteredProducts.map((productPreview: ProductPreviewType) => (
          <li key={productPreview.id}>
            <ProductPreview region={region} productPreview={productPreview} />
          </li>
        ))}
      </ul>
    </div>
  )
}
