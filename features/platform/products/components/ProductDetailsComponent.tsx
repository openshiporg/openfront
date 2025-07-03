"use client";

import React, { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Layers, Archive } from "lucide-react";
import Link from "next/link";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";
import { ProductImage } from "../../components/ProductImage";
import { ProductSectionTabs } from "./ProductSectionTabs";

const statusColors = {
  draft: "zinc",
  proposed: "blue",
  published: "emerald",
  rejected: "rose",
} as const;

interface ProductVariant {
  id: string;
  title: string;
  sku?: string;
  inventoryQuantity?: number;
  manageInventory?: boolean;
}

interface ProductImage {
  id: string;
  image?: { url: string };
  imagePath?: string;
  altText?: string;
}

interface Product {
  id: string;
  title: string;
  handle?: string;
  status: string;
  subtitle?: string;
  thumbnail?: string;
  discountable?: boolean;
  isGiftcard?: boolean;
  createdAt: string;
  updatedAt?: string;
  productType?: {
    id: string;
    value: string;
  };
  productVariants?: ProductVariant[];
  productImages?: ProductImage[];
  productCategories?: Array<{
    id: string;
    title: string;
  }>;
  productCollections?: Array<{
    id: string;
    title: string;
  }>;
}

interface ProductDetailsComponentProps {
  product: Product;
  list: any;
}

export function ProductDetailsComponent({
  product,
  list,
}: ProductDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  const variantCount = product.productVariants?.length || 0;
  const imageCount = product.productImages?.length || 0;
  const totalInventory =
    product.productVariants?.reduce(
      (sum, variant) => sum + (variant.inventoryQuantity || 0),
      0
    ) || 0;

  const imageUrl =
    product.thumbnail ||
    product.productImages?.[0]?.image?.url ||
    product.productImages?.[0]?.imagePath;

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={product.id} className="border-0">
          <div className="px-4 md:px-6 py-3 md:py-4 flex justify-between w-full border-b relative min-h-[120px]">
            <div className="flex items-start gap-4">
              {/* Product Image */}
              <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 overflow-hidden">
                <ProductImage
                  src={imageUrl}
                  alt={product.title}
                  width={80}
                  height={80}
                  className="w-full h-full"
                />
              </div>

              {/* Product Info */}
              <div className="flex flex-col items-start text-left gap-2 sm:gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/dashboard/platform/products/${product.id}`}
                    className="font-medium text-base hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {product.title}
                  </Link>
                  <span>‧</span>

                  <span className="text-sm font-medium">
                    <span className="text-muted-foreground/75">
                      {new Date(product.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </span>
                </div>

                {product.subtitle && (
                  <p className="text-sm text-muted-foreground">
                    {product.subtitle}
                  </p>
                )}
                {product.handle && (
                  <span className="text-muted-foreground text-xs">
                    {product.handle}
                  </span>
                )}
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Layers className="size-3" />
                    <span className="font-medium">{variantCount}</span>
                    <span>variants</span>
                  </div>
                  <span>‧</span>

                  <div className="flex items-center gap-1.5">
                    <Archive className="size-3" />
                    <span className="font-medium">{totalInventory}</span>
                    <span>in stock</span>
                  </div>
                  <span>‧</span>

                  {imageCount > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">{imageCount}</span>
                      <span>image{imageCount > 1 ? "s" : ""}</span>
                    </div>
                  )}
                  {product.productType && (
                    <Badge variant="secondary" className="text-xs">
                      {product.productType.value}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between h-full">
              <div className="flex items-center gap-2">
                <Badge
                  color={
                    statusColors[product.status as keyof typeof statusColors] ||
                    "zinc"
                  }
                  className="text-[.6rem] sm:text-[.7rem] py-0 px-2 sm:px-3 tracking-wide font-medium rounded-md border h-6"
                >
                  {product.status.toUpperCase()}
                </Badge>
                {product.isGiftcard && (
                  <Badge variant="outline" className="text-xs">
                    Gift Card
                  </Badge>
                )}
                {/* Single buttons container */}
                <div className="absolute bottom-3 right-5 sm:static flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="border [&_svg]:size-3 h-6 w-6"
                    onClick={() => setIsEditDrawerOpen(true)}
                  >
                    <MoreVertical className="stroke-muted-foreground" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="border [&_svg]:size-3 h-6 w-6"
                    asChild
                  >
                    <AccordionTrigger className="py-0" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <AccordionContent className="pb-0">
            {variantCount > 0 ? (
              <ProductSectionTabs product={product} />
            ) : (
              <div className="px-4 md:px-6 py-4 border-b">
                <p className="text-sm text-muted-foreground">
                  No variants configured
                </p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <EditItemDrawerClientWrapper
        listKey="products"
        itemId={product.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
      />
    </>
  );
}