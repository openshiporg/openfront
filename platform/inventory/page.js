'use client';

import React from 'react';
import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { Card, CardContent } from "@ui/card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { Input } from "@ui/input";
import { ChevronDownIcon, ChevronRightIcon, PackageIcon } from "lucide-react";
import AdjustStockModal from './components/AdjustStockModal';

const INVENTORY_QUERY = gql`
  query GetInventory {
    products {
      id
      title
      thumbnail
      productVariants {
        id
        title
        sku
        barcode
        inventoryQuantity
        allowBackorder
        manageInventory
        stockMovements(orderBy: { createdAt: desc }, take: 1) {
          id
          type
          quantity
          createdAt
        }
      }
    }
  }
`;

export default function InventoryPage() {
  const { data, loading, refetch } = useQuery(INVENTORY_QUERY);
  const [expandedProducts, setExpandedProducts] = React.useState(new Set());
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedVariant, setSelectedVariant] = React.useState(null);

  const toggleProduct = (productId) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const filteredProducts = data?.products?.filter(product => 
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.productVariants.some(variant => 
      variant.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      variant.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="flex h-full flex-col gap-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-sm text-zinc-500">
            Manage product stock levels and variants
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search products or variants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-80"
          />
          <Button variant="outline">Export Inventory</Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="py-8 text-center text-zinc-500">Loading...</div>
          ) : filteredProducts?.length === 0 ? (
            <div className="py-8 text-center text-zinc-500">No products found</div>
          ) : (
            <div className="space-y-2">
              {filteredProducts?.map((product) => (
                <div key={product.id} className="rounded-lg border">
                  <div 
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-zinc-50"
                    onClick={() => toggleProduct(product.id)}
                  >
                    <button className="text-zinc-500">
                      {expandedProducts.has(product.id) ? (
                        <ChevronDownIcon className="h-5 w-5" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5" />
                      )}
                    </button>
                    {product.thumbnail ? (
                      <img 
                        src={product.thumbnail} 
                        alt={product.title}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-zinc-100">
                        <PackageIcon className="h-5 w-5 text-zinc-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium">{product.title}</h3>
                      <p className="text-sm text-zinc-500">
                        {product.productVariants.length} variants
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Total Stock: {product.productVariants.reduce((sum, variant) => sum + variant.inventoryQuantity, 0)}
                      </Badge>
                    </div>
                  </div>

                  {expandedProducts.has(product.id) && (
                    <div className="border-t bg-zinc-50">
                      <div className="grid grid-cols-6 gap-4 px-4 py-2 text-sm font-medium text-zinc-500">
                        <div className="col-span-2">Variant</div>
                        <div>SKU</div>
                        <div>In Stock</div>
                        <div>Last Movement</div>
                        <div></div>
                      </div>
                      {product.productVariants.map((variant) => (
                        <div 
                          key={variant.id} 
                          className="grid grid-cols-6 gap-4 border-t px-4 py-3 text-sm"
                        >
                          <div className="col-span-2">
                            <p className="font-medium">{variant.title}</p>
                            {variant.barcode && (
                              <p className="text-xs text-zinc-500">
                                Barcode: {variant.barcode}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center">
                            {variant.sku || '-'}
                          </div>
                          <div className="flex items-center">
                            <Badge variant={variant.inventoryQuantity > 0 ? 'success' : 'destructive'}>
                              {variant.inventoryQuantity}
                            </Badge>
                          </div>
                          <div className="flex items-center text-zinc-500">
                            {variant.stockMovements?.[0] ? (
                              <>
                                {variant.stockMovements[0].type === 'RECEIVE' ? '+' : '-'}
                                {variant.stockMovements[0].quantity} on{' '}
                                {new Date(variant.stockMovements[0].createdAt).toLocaleDateString()}
                              </>
                            ) : (
                              '-'
                            )}
                          </div>
                          <div className="flex items-center justify-end">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedVariant(variant);
                              }}
                            >
                              Adjust Stock
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AdjustStockModal
        isOpen={!!selectedVariant}
        onClose={() => setSelectedVariant(null)}
        variant={selectedVariant}
        onSuccess={() => {
          refetch();
          setSelectedVariant(null);
        }}
      />
    </div>
  );
} 