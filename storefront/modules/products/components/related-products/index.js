
import { getProductsList } from "@storefront/lib/data/products";
import { getRegion } from "@storefront/lib/data/regions";
import ProductPreview from "../product-preview";

export default async function RelatedProducts({ product, countryCode }) {
  const region = await getRegion(countryCode);

  if (!region) {
    return null;
  }

  // Updated to use camelCase parameters
  const setQueryParams = () => {
    const params = {};

    if (product.productCollections[0]?.id) {
      params.collectionId = product.productCollections[0].id;
    }

    if (product.tags) {
      params.tags = product.tags.map((t) => t.value);
    }

    params.isGiftcard = false;
    params.limit = 4; // Set a reasonable limit for related products

    return params;
  };

  const queryParams = setQueryParams();

  const productPreviews = await getProductsList({
    queryParams,
    countryCode,
  }).then(({ response }) => {
    return response.products.filter(
      (responseProduct) => responseProduct.id !== product.id
    );
  });


  if (!productPreviews.length) {
    return null;
  }

  return (
    <div className="product-page-constraint">
      <div className="flex flex-col items-center text-center mb-16">
        <span className="text-base-regular text-gray-600 mb-6">
          Related products
        </span>
        <p className="text-2xl-regular text-ui-fg-base max-w-lg">
          You might also want to check out these products.
        </p>
      </div>

      <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8">
        {productPreviews.map((productPreview) => (
          <li key={productPreview.id}>
            <ProductPreview region={region} productPreview={productPreview} />
          </li>
        ))}
      </ul>
    </div>
  );
}
