// Removed HttpTypes and Container imports
import Image from "next/image"

// Define inline type based on GraphQL Image schema and component usage
type ImageInfo = {
  id: string;
  url?: string | null;
  // Add other fields if needed, e.g., altText
  altText?: string | null; // Example, adjust based on actual schema/usage
};

type ImageGalleryProps = {
  images: any[];
};

const ImageGallery = ({ images }: ImageGalleryProps) => {
  return (
    <div className="flex items-start relative">
      <div className="flex flex-col flex-1 sm:mx-16 gap-y-4">
        {images.map((image, index) => {
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
                alt={`Product image ${index + 1}`}
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
