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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreVertical, Package, FolderTree, Eye, EyeOff } from "lucide-react";
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

type TabType = 'products';

export function ProductCategoryDetailsComponent({
  productcategory,
  list,
}: ProductCategoryDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  
  const products = productcategory.products || [];
  const totalProducts = products.length;
  
  // Calculate pagination for products
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);
  
  // Build tabs array
  const tabs = [
    { 
      key: 'products' as TabType, 
      label: 'Products',
      count: totalProducts,
      data: products
    }
  ];

  const activeTabData = tabs.find(tab => tab.key === activeTab);
  
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
            {/* Responsive Tabs Navigation */}
            <div className="bg-muted/80 border-b">
              {/* Desktop: Horizontal Tab Buttons */}
              <div className="hidden md:flex items-center gap-3 px-4 py-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative z-10 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-300 border ${
                      activeTab === tab.key 
                        ? 'bg-background border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100' 
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-background/50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Products</span>
                      <span className="rounded-sm bg-muted border px-1.5 py-0 text-[10px] leading-[14px] font-medium text-muted-foreground inline-flex items-center h-[18px]">
                        {tab.count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Mobile: Select Dropdown */}
              <div className="md:hidden px-4 py-2">
                <div className="w-fit">
                  <Select value={activeTab} onValueChange={(value: TabType) => setActiveTab(value)}>
                    <SelectTrigger className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-background border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 h-auto w-auto">
                      <div className="flex items-center gap-1.5">
                        <SelectValue />
                        <span className="rounded-sm bg-muted border px-1.5 py-0 text-[10px] leading-[14px] font-medium text-muted-foreground inline-flex items-center h-[18px]">
                          ({activeTabData?.count || 0})
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {tabs.map((tab) => (
                        <SelectItem key={tab.key} value={tab.key} className="text-xs">
                          Products
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Tab Content Area */}
            <div className="bg-muted/40">
              {activeTab === 'products' && totalProducts > 0 && (
                <div className="px-4 py-2">
                  {/* Pagination Controls */}
                  {totalProducts > itemsPerPage && (
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-xs text-muted-foreground">
                        Showing {startIndex + 1}-{Math.min(endIndex, totalProducts)} of{" "}
                        {totalProducts} products
                      </div>
                      <ItemPagination
                        currentPage={currentPage}
                        totalItems={totalProducts}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
                  
                  {/* Products Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedProducts.map((product) => (
                      <div key={product.id} className="rounded-md border bg-background p-4 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-shrink-0">
                            <ProductImage
                              src={product.thumbnail}
                              alt={product.title}
                              className="size-12 rounded-sm"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/dashboard/platform/products/${product.id}`}
                              className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 truncate block"
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
                            </div>
                            {product.productVariants && product.productVariants.length > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {product.productVariants.length} variant{product.productVariants.length !== 1 ? "s" : ""}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
