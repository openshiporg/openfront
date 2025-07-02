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
import { MoreVertical, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ItemPagination } from "../../orders/components/ItemPagination";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";

const statusColors = {
  "active": "emerald",
  "inactive": "zinc"
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
  status?: string;
  createdAt: string;
  updatedAt?: string;
  products?: Product[];
  // Add more fields as needed based on your GraphQL schema
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
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'proposed':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const triggerClassName =
    "flex items-center rounded-sm shadow-sm uppercase tracking-wide border max-w-fit gap-2 text-nowrap pl-2.5 pr-1 py-[3px] text-sm font-medium text-orange-500 bg-white border-orange-200 hover:bg-orange-100 hover:text-orange-700 focus:z-10 focus:ring-2 focus:ring-orange-700 focus:text-orange-700 dark:bg-orange-950 dark:border-orange-900 dark:text-orange-300 dark:hover:text-white dark:hover:bg-orange-700 dark:focus:ring-orange-500 dark:focus:text-white";

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={productcategory.id} className="border-0">
          <div className="px-4 md:px-6 py-3 md:py-4 flex justify-between w-full border-b relative min-h-[80px]">
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
                
                {/* Add more fields display here as needed */}
              </div>
            </div>

            <div className="flex flex-col justify-between h-full">
              <div className="flex items-center gap-2">
                {productcategory.status && (
                  <Badge
                    color={
                      statusColors[productcategory.status as keyof typeof statusColors] ||
                      "zinc"
                    }
                    className="text-[.6rem] sm:text-[.7rem] py-0 px-2 sm:px-3 tracking-wide font-medium rounded-md border h-6"
                  >
                    {productcategory.status.toUpperCase()}
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
                  className="flex flex-col gap-2 py-3 px-4 md:px-6 bg-orange-50/30 dark:bg-orange-900/10 border-b"
                >
                  <div className="flex items-center gap-2">
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
                            className="border p-2 bg-background rounded-sm flex flex-col sm:flex-row gap-4 relative"
                          >
                            {product.thumbnail && (
                              <div className="flex-shrink-0">
                                <Image
                                  src={product.thumbnail}
                                  alt={product.title}
                                  width={48}
                                  height={48}
                                  className="size-12 rounded-lg object-cover"
                                />
                              </div>
                            )}
                            <div className="grid flex-grow">
                              <span className="text-sm font-medium">{product.title}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={getStatusColor(product.status)}>
                                  {product.status}
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
              
              {/* Details Section */}
              <div className="px-4 md:px-6 py-4">
                <h4 className="text-sm font-medium mb-3">Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">ID:</span>
                    <span className="ml-2 font-medium">{productcategory.id}</span>
                  </div>
                  {productcategory.updatedAt && (
                    <div>
                      <span className="text-muted-foreground">Updated:</span>
                      <span className="ml-2 font-medium">
                        {new Date(productcategory.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
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
