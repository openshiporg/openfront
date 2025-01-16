import React from "react";
import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { PlusIcon } from "lucide-react";

const PRODUCT_COLLECTIONS_QUERY = gql`
  query ProductCollections($where: ProductCollectionWhereInput = {}, $orderBy: [ProductCollectionOrderByInput!] = [], $take: Int, $skip: Int) {
    productCollections(
      where: $where,
      orderBy: $orderBy,
      take: $take,
      skip: $skip
    ) {
      id
      title
      products {
        id
        title
      }
    }
    productCollectionsCount(where: $where)
  }
`;

const CREATE_PRODUCT_COLLECTION_MUTATION = gql`
  mutation CreateProductCollection($data: ProductCollectionCreateInput!) {
    createProductCollection(data: $data) {
      id
      title
    }
  }
`;

export function ProductCollections({ selectedCollections = [], onSelect }) {
  const { data, loading } = useQuery(PRODUCT_COLLECTIONS_QUERY);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Collections</h3>
        <Button variant="outline" size="sm">
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Collection
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {data?.productCollections?.map((collection) => (
          <Badge
            key={collection.id}
            variant={selectedCollections.includes(collection.id) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onSelect(collection)}
          >
            {collection.title}
            <span className="ml-1 text-xs">({collection.products?.length || 0})</span>
          </Badge>
        ))}
      </div>
    </div>
  );
} 