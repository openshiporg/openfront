import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Field as ImageField } from "@keystone/themes/Tailwind/orion/views/Image";

export function ProductMedia({ value, onChange }) {
  const images = value.productImages || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <ImageField
              key={image.id}
              field={{
                path: `productImages.${index}`,
                label: `Image ${index + 1}`,
              }}
              value={
                image.image
                  ? {
                      kind: "from-server",
                      data: {
                        id: image.image.id,
                        src: image.image.url,
                        width: image.image.width,
                        height: image.image.height,
                        filesize: image.image.filesize,
                        extension: image.image.extension,
                      },
                    }
                  : { kind: "empty" }
              }
              onChange={(imageValue) => {
                const newImages = [...images];
                if (imageValue.kind === "remove") {
                  newImages.splice(index, 1);
                } else if (imageValue.kind === "upload") {
                  newImages[index] = {
                    ...image,
                    image: {
                      upload: imageValue.data.file,
                    },
                  };
                }
                onChange({
                  ...value,
                  productImages: newImages,
                });
              }}
            />
          ))}
          <ImageField
            field={{
              path: "newImage",
              label: "Add Image",
            }}
            value={{ kind: "empty" }}
            onChange={(imageValue) => {
              if (imageValue.kind === "upload") {
                onChange({
                  ...value,
                  productImages: [
                    ...images,
                    {
                      image: {
                        upload: imageValue.data.file,
                      },
                    },
                  ],
                });
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
} 