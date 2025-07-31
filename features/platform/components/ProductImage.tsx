import React, { useState } from 'react';
import Image from 'next/image';
import { Boxes } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductImageProps {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  iconClassName?: string;
}

export function ProductImage({
  src,
  alt,
  width = 48,
  height = 48,
  className,
  iconClassName,
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  // Calculate icon size based on container size - default to 1/3 of container size
  const getIconSize = () => {
    if (iconClassName) return iconClassName;
    const size = Math.min(width, height);
    if (size <= 32) return "size-3";
    if (size <= 48) return "size-4";
    if (size <= 64) return "size-5";
    return "size-6";
  };

  // Create fallback component
  const FallbackIcon = () => (
    <div 
      className={cn(
        "flex items-center justify-center bg-muted rounded-sm",
        className
      )}
      style={{ width, height }}
    >
      <Boxes className={cn(
        "text-muted-foreground",
        getIconSize()
      )} />
    </div>
  );

  // If no src or has error, show fallback
  if (!src || hasError) {
    return <FallbackIcon />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn(
        "object-cover rounded-sm",
        className
      )}
      onError={() => setHasError(true)}
    />
  );
}