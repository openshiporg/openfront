import React from "react";
import { gql } from "@keystone-6/core/admin-ui/apollo";
import { ItemPageTemplate } from "@keystone/components/ItemPage";
import { ProductVariants } from "../components/ProductVariants";
import { ProductMedia } from "../components/ProductMedia";
import { ProductCollections } from "../components/ProductCollections";
import { Badge } from "@ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";

const PRODUCT_QUERY = gql`
  query Product($where: ProductWhereUniqueInput!) {
    product(where: $where) {
      id
      title
      description
      handle
      status
      metadata
      productVariants {
        id
        title
        sku
        barcode
        ean
        upc
        inventoryQuantity
        allowBackorder
        manageInventory
        weight
        length
        height
        width
        metadata
      }
      productCollections {
        id
        title
      }
      productImages {
        id
        image {
          id
          url
          width
          height
          filesize
          extension
        }
        altText
      }
      createdAt
      updatedAt
    }
  }
`;

export default function ProductPage({ params }) {
  return (
    <ItemPageTemplate
      listKey="Product"
      itemId={params.id}
      query={PRODUCT_QUERY}
      tabs={[
        {
          label: "General",
          content: ({ item }) => (
            <div className="grid gap-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold tracking-tight">{item.title}</h2>
                  {item.handle && (
                    <div className="text-sm text-muted-foreground">/{item.handle}</div>
                  )}
                </div>
                <Badge variant={item.status === "published" ? "default" : "secondary"}>
                  {item.status}
                </Badge>
              </div>
              <Tabs defaultValue="details" className="w-full">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="variants">Variants</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                  <TabsTrigger value="collections">Collections</TabsTrigger>
                </TabsList>
                <TabsContent value="details">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">Description</h3>
                      <p className="text-sm text-muted-foreground">{item.description || "No description"}</p>
                    </div>
                    {item.metadata && Object.keys(item.metadata).length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-medium">Metadata</h3>
                        <pre className="text-sm bg-muted rounded-md p-4">
                          {JSON.stringify(item.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="variants">
                  <ProductVariants value={item} />
                </TabsContent>
                <TabsContent value="media">
                  <ProductMedia value={item} />
                </TabsContent>
                <TabsContent value="collections">
                  <ProductCollections value={item} />
                </TabsContent>
              </Tabs>
            </div>
          ),
        },
      ]}
    />
  );
} 