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
import { MoreVertical, Package } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { ItemPagination } from "../../orders/components/ItemPagination";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";
import { ProductImage } from "../../components/ProductImage";

interface Product {
  id: string;
  title: string;
  status: string;
  thumbnail?: string;
  productVariants?: { id: string }[];
}

interface Collection {
  id: string;
  title: string;
  handle: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  products?: Product[];
}

interface CollectionDetailsComponentProps {
  collection: Collection;
  list: any;
}

type TabType = 'products';

export function CollectionDetailsComponent({
  collection,
  list,
}: CollectionDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [currentPage, setCurrentPage] = useState(1);
  const [editProductId, setEditProductId] = useState<string>('');
  const [editProductOpen, setEditProductOpen] = useState(false);
  const itemsPerPage = 12;
  
  const products = collection.products || [];
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
  
  const handleEditProduct = (productId: string) => {
    setEditProductId(productId);
    setEditProductOpen(true);
  };
  
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
        <AccordionItem value={collection.id} className="border-0">
          <div className="px-4 md:px-6 py-3 md:py-4 flex justify-between w-full border-b relative min-h-[80px]">
            <div className="flex items-start gap-4">
              {/* Collection Info */}
              <div className="flex flex-col items-start text-left gap-2 sm:gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/dashboard/platform/product-collections/${collection.id}`}
                    className="font-medium text-base hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {collection.title}
                  </Link>
                  <span>‧</span>
                  <span className="text-sm font-medium">
                    <span className="text-muted-foreground/75">
                      {new Date(collection.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="font-medium">{collection.handle}</span>
                  <span>‧</span>
                  <div className="flex items-center gap-1.5">
                    <Package className="size-3" />
                    <span className="font-medium">{totalProducts}</span>
                    <span>product{totalProducts !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between h-full">
              <div className="flex items-center gap-2">
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
            <div className="bg-muted/40">
              {/* Desktop: Horizontal Tab Buttons */}
              <div className="hidden md:flex items-center gap-3 px-4 pt-2">
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
                      <span className="rounded-sm bg-muted border px-1.5 py-0 text-[10px] leading-[14px] font-medium text-muted-foreground inline-flex items-center h-[18px] -mr-1">
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
                        <span className="rounded-sm bg-muted border px-1.5 py-0 text-[10px] leading-[14px] font-medium text-muted-foreground inline-flex items-center h-[18px] -mr-1">
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
                      <div key={product.id} className="rounded-md border bg-background p-4 shadow-sm relative">
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
                        <div className="absolute top-2 right-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditProduct(product.id)}>
                                Edit Product
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
        listKey="product-collections"
        itemId={collection.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
      />

      {/* Edit Product Drawer */}
      {editProductId && (
        <EditItemDrawerClientWrapper
          listKey="products"
          itemId={editProductId}
          open={editProductOpen}
          onClose={() => {
            setEditProductOpen(false);
            setEditProductId('');
          }}
        />
      )}
    </>
  );
}