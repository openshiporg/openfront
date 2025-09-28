"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { isEqual } from "lodash"
import { retrievePricedProductByHandle } from "../../../../lib/data/products"

// Define inline type based on GraphQL Image schema and component usage
type ImageInfo = {
  id: string;
  url?: string | null;
  // Add other fields if needed, e.g., altText
  altText?: string | null; // Example, adjust based on actual schema/usage
};

type ImageGalleryProps = {
  images: any[];
  handle: string;
  region: any;
};

const ImageGallery = ({ images, handle, region }: ImageGalleryProps) => {
  const [selectedVariant, setSelectedVariant] = useState<any>(null)

  // Listen for variant changes from ProductActions
  useEffect(() => {
    const handleVariantChange = (event: any) => {
      setSelectedVariant(event.detail)
    }

    window.addEventListener('variantChange', handleVariantChange)
    return () => window.removeEventListener('variantChange', handleVariantChange)
  }, [])

  // Sort images by order field first, then apply variant logic
  const sortedImages = [...images].sort((a, b) => (a.order || 0) - (b.order || 0))

  // Determine which images to show - prioritize variant primary image if selected
  const displayImages = selectedVariant?.primaryImage
    ? [selectedVariant.primaryImage, ...sortedImages.filter(img => img.id !== selectedVariant.primaryImage.id)]
    : sortedImages

  return (
    <div className="flex items-start relative">
      <div className="flex flex-col flex-1 sm:mx-16 gap-y-4">
        {displayImages.map((image, index) => {
          return (
            <div
              key={image.id}
              className="relative aspect-[29/34] w-full overflow-hidden bg-muted"
              id={image.id}
            >
              <Image
                src={image?.image?.url || image?.imagePath || "/images/placeholder.svg"}
                priority={index <= 2 ? true : false}
                className="absolute inset-0 rounded-rounded"
                alt={image?.altText || `Product image ${index + 1}`}
                fill
                sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
                style={{
                  objectFit: "cover",
                }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ImageGallery
