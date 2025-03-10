import { Container } from "@medusajs/ui";
import Image from "next/image";

const ImageGallery = ({ images }) => {
  return (
    <div className="flex items-start relative">
      <div className="flex flex-col flex-1 small:mx-16 gap-y-4">
        {images.map(({ id, image, imagePath }, index) => {
          return (
            <Container
              key={id}
              className="relative aspect-[29/34] w-full overflow-hidden bg-ui-bg-subtle"
              id={id}
            >
              <Image
                src={image?.url || imagePath || "/images/placeholder.svg"}
                priority={index <= 2 ? true : false}
                className="absolute inset-0 rounded-rounded"
                alt={`Product image ${index + 1}`}
                fill
                sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
                style={{
                  objectFit: "cover",
                }}
              />
            </Container>
          );
        })}
      </div>
    </div>
  );
};

export default ImageGallery;
