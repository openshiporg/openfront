import React from "react";
import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { PriceListForm } from "../components/PriceListForm";
import { PriceListPrices } from "../components/PriceListPrices";
import { PriceListConditions } from "../components/PriceListConditions";
import { Badge } from "@ui/badge";

const PRICE_LIST_QUERY = gql`
  query PriceList($where: PriceListWhereUniqueInput!) {
    priceList(where: $where) {
      id
      name
      description
      status
      type
      startsAt
      endsAt
      customerGroups {
        id
        name
      }
      prices {
        id
        amount
        variantId
        variant {
          id
          title
          sku
          product {
            title
          }
        }
        currencyCode
        minQuantity
        maxQuantity
      }
      metadata
    }
  }
`;

export default function PriceListPage({ params }) {
  const { data, loading } = useQuery(PRICE_LIST_QUERY, {
    variables: { id: params.id }
  });

  if (loading) return <div>Loading...</div>;
  if (!data?.priceList) return <div>Price list not found</div>;

  const priceList = data.priceList;

  return (
    <div className="flex h-full flex-col gap-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Edit Price List</h1>
          <p className="text-sm text-zinc-500">{priceList.name}</p>
        </div>
        <Badge variant={priceList.status === "active" ? "success" : "secondary"}>
          {priceList.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <PriceListForm priceList={priceList} />
          <PriceListPrices prices={priceList.prices} />
        </div>
        
        <div className="space-y-4">
          <PriceListConditions 
            customerGroups={priceList.customerGroups}
            type={priceList.type}
            startsAt={priceList.startsAt}
            endsAt={priceList.endsAt}
          />
        </div>
      </div>
    </div>
  );
} 