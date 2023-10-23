import PlaceholderImage from "@modules/common/icons/placeholder-image"
import clsx from "clsx"
import Image from "next/image"
import React from "react"

const Thumbnail = ({
  thumbnail,
  images,
  size = "small",
}) => {
  const initialImage = thumbnail || images?.[0]?.url

  return (
    <div
      className={clsx("relative aspect-[29/34]", {
        "w-[180px]": size === "small",
        "w-[290px]": size === "medium",
        "w-[440px]": size === "large",
        "w-full": size === "full",
      })}>
      <ImageOrPlaceholder image={initialImage} size={size} />
    </div>
  );
}

const ImageOrPlaceholder = ({
  image,
  size
}) => {
  return image ? (
    <Image
      src={image}
      alt="Thumbnail"
      className="absolute inset-0"
      draggable={false}
      fill
      sizes="100vw"
      style={{
        objectFit: "cover",
        objectPosition: "center",
      }} />
  ) : (
    <div
      className="w-full h-full absolute inset-0 bg-gray-100 flex items-center justify-center">
      <PlaceholderImage size={size === "small" ? 16 : 24} />
    </div>
  );
}

export default Thumbnail
