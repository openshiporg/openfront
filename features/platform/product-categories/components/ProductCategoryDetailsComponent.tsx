"use client";

import React, { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, ChevronsUpDown, Package, FolderTree, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { ItemPagination } from "../../orders/components/ItemPagination";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";
import { ProductImage } from "../../components/ProductImage";

const statusColors = {
  active: "emerald",
  inactive: "zinc"
} as const;

interface Product {
  id: string;
  title: string;
  status: string;
  thumbnail?: string;
  productVariants?: { id: string }[];
}

interface ProductCategory {
  id: string;
  title: string;
  handle?: string;
  isActive?: boolean;
  isInternal?: boolean;
  status?: string;
  createdAt: string;
  updatedAt?: string;
  parentCategory?: {
    id: string;
    title: string;
  };
  products?: Product[];
}

interface ProductCategoryDetailsComponentProps {
  productcategory: ProductCategory;
  list: any;
}

export function ProductCategoryDetailsComponent({
  productcategory,
  list,
}: ProductCategoryDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const products = productcategory.products || [];
  const totalProducts = products.length;
  
  // Calculate pagination for products
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);
  
  // Status badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'emerald';
      case 'draft':
        return 'zinc';
      case 'proposed':
        return 'blue';
      case 'rejected':
        return 'red';
      default:
        return 'zinc';
    }
  };
  
  const triggerClassName =
    "flex items-center rounded-sm shadow-sm uppercase tracking-wide border max-w-fit gap-2 text-nowrap pl-2.5 pr-1 py-[3px] text-sm font-medium text-slate-500 bg-white border-slate-200 hover:bg-slate-100 hover:text-slate-700 focus:z-10 focus:ring-2 focus:ring-slate-700 focus:text-slate-700 dark:bg-slate-950 dark:border-slate-900 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700 dark:focus:ring-slate-500 dark:focus:text-white";

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={productcategory.id} className="border-0">
          <div className="px-4 md:px-6 py-3 md:py-4 flex justify-between w-full border-b relative min-h-[100px]">
            <div className="flex items-start gap-4">
              {/* ProductCategory Info */}
              <div className="flex flex-col items-start text-left gap-2 sm:gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/dashboard/platform/product-categories/${productcategory.id}`}
                    className="font-medium text-base hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {productcategory.title}
                  </Link>
                  <span>‧</span>
                  <span className="text-sm font-medium">
                    <span className="text-muted-foreground/75">
                      {new Date(productcategory.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </span>
                </div>
                
                {/* Handle/Slug */}
                {productcategory.handle && (
                  <span className="text-muted-foreground text-xs font-mono bg-muted px-2 py-0.5 rounded">
                    /{productcategory.handle}
                  </span>
                )}
                
                {/* Parent Category */}
                {productcategory.parentCategory && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FolderTree className="size-3" />
                    <span>Child of</span>
                    <Link
                      href={`/dashboard/platform/product-categories/${productcategory.parentCategory.id}`}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      {productcategory.parentCategory.title}
                    </Link>
                  </div>
                )}

                {/* Category Stats */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Package className="size-3" />
                    <span className="font-medium">{totalProducts}</span>
                    <span>product{totalProducts !== 1 ? "s" : ""}</span>
                  </div>
                  
                  {productcategory.isInternal && (
                    <>
                      <span>‧</span>
                      <div className="flex items-center gap-1.5">
                        <EyeOff className="size-3" />
                        <span>Internal</span>
                      </div>
                    </>
                  )}
                  
                  <span>‧</span>
                  <div className="flex items-center gap-1.5">
                    {productcategory.isActive ? (
                      <Eye className="size-3 text-emerald-600" />
                    ) : (
                      <EyeOff className="size-3 text-zinc-500" />
                    )}
                    <span>
                      {productcategory.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between h-full">
              <div className="flex items-center gap-2">
                {productcategory.isActive !== undefined && (
                  <Badge
                    color={productcategory.isActive ? "emerald" : "zinc"}
                    className="text-[.6rem] sm:text-[.7rem] py-0 px-2 sm:px-3 tracking-wide font-medium rounded-md border h-6"
                  >
                    {productcategory.isActive ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                )}
                
                {productcategory.isInternal && (
                  <Badge
                    color="blue"
                    className="text-[.6rem] sm:text-[.7rem] py-0 px-2 sm:px-3 tracking-wide font-medium rounded-md border h-6"
                  >
                    INTERNAL
                  </Badge>
                )}
                
                {/* Action buttons */}
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
              {/* Products Section */}
              {totalProducts > 0 && (
                <Collapsible
                  open={isProductsOpen}
                  onOpenChange={setIsProductsOpen}
                  className="flex flex-col gap-2 py-3 px-4 md:px-6 bg-slate-50/30 dark:bg-slate-900/10 border-b"
                >
                  <div className="flex items-center justify-between w-full">
                    <CollapsibleTrigger asChild>
                      <button type="button" className={triggerClassName}>
                        {totalProducts} Product{totalProducts !== 1 ? "s" : ""}
                        <ChevronsUpDown className="h-4 w-4" />
                      </button>
                    </CollapsibleTrigger>
                    {isProductsOpen && totalProducts > 5 && (
                      <ItemPagination
                        currentPage={currentPage}
                        totalItems={totalProducts}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                      />
                    )}
                  </div>
                  <CollapsibleContent className="space-y-2">
                    {isProductsOpen && (
                      <>
                        {totalProducts > 5 && (
                          <div className="text-xs text-muted-foreground">
                            Showing {startIndex + 1}-{Math.min(endIndex, totalProducts)} of{" "}
                            {totalProducts} products
                          </div>
                        )}
                        {paginatedProducts.map((product) => (
                          <div
                            key={product.id}
                            className="border p-2 bg-background rounded-sm flex flex-row gap-4 relative"
                          >
                            <div className="flex-shrink-0">
                              <ProductImage
                                src={product.thumbnail}
                                alt={product.title}
                                className="size-12 rounded-sm"
                              />
                            </div>
                            <div className="grid flex-grow min-w-0">
                              <Link
                                href={`/dashboard/platform/products/${product.id}`}
                                className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 truncate"
                              >
                                {product.title}
                              </Link>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  color={getStatusColor(product.status)}
                                  className="text-[.6rem] py-0 px-2 tracking-wide font-medium rounded-md border h-5"
                                >
                                  {product.status.toUpperCase()}
                                </Badge>
                                {product.productVariants && product.productVariants.length > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    {product.productVariants.length} variant{product.productVariants.length !== 1 ? "s" : ""}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <EditItemDrawerClientWrapper
        listKey="product-categories"
        itemId={productcategory.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
      />
    </>
  );
}
