import React from 'react';
import Image from 'next/image';
import { Package } from 'lucide-react';
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
  if (src) {
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
        onError={(e) => {
          // Hide broken image and show placeholder
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="flex items-center justify-center bg-muted rounded-lg size-12">
                <svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-6a2 2 0 00-2 2v3a2 2 0 002 2h6a2 2 0 002-2v-3z"></path>
                </svg>
              </div>
            `;
          }
        }}
      />
    );
  }

  return (
    <div className={cn(
      "flex items-center justify-center bg-muted rounded-sm",
      className
    )}>
      <Package className={cn(
        "text-muted-foreground",
        iconClassName || "size-4"
      )} />
    </div>
  );
}