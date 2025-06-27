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
import { MoreVertical, Package, Layers, Archive } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { EditItemDrawer } from "../../components/EditItemDrawer";

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
              <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.title}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
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
            <div className="divide-y">
              {/* Variants Section */}
              <div className="px-4 md:px-6 py-4">
                <h4 className="text-sm font-medium mb-3">
                  Variants & Inventory
                </h4>
                {product.productVariants &&
                product.productVariants.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {product.productVariants.map((variant) => (
                      <div
                        key={variant.id}
                        className="border rounded-lg p-3 bg-muted/30"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {variant.title}
                            </p>
                            {variant.sku && (
                              <p className="text-xs text-muted-foreground mt-1">
                                SKU: {variant.sku}
                              </p>
                            )}
                          </div>
                          {variant.manageInventory && (
                            <Badge
                              variant={
                                variant.inventoryQuantity === 0
                                  ? "destructive"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {variant.inventoryQuantity || 0} in stock
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No variants configured
                  </p>
                )}
              </div>

              {/* Organization Section */}
              {product.productCategories?.length ||
              product.productCollections?.length ? (
                <div className="px-4 md:px-6 py-4">
                  <h4 className="text-sm font-medium mb-3">Organization</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.productCategories?.map((category) => (
                      <Badge key={category.id} variant="secondary">
                        {category.title}
                      </Badge>
                    ))}
                    {product.productCollections?.map((collection) => (
                      <Badge key={collection.id} variant="outline">
                        {collection.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Product Settings */}
              <div className="px-4 md:px-6 py-4">
                <h4 className="text-sm font-medium mb-3">Product Settings</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Discountable:</span>
                    <span className="ml-2 font-medium">
                      {product.discountable ? "Yes" : "No"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gift Card:</span>
                    <span className="ml-2 font-medium">
                      {product.isGiftcard ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <EditItemDrawer
        list={list}
        item={product}
        itemId={product.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
      />
    </>
  );
}