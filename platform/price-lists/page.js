import React from "react";
import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { PriceListTable } from "./components/PriceListTable";
import { Button } from "@ui/button";
import { PlusIcon } from "lucide-react";

const PRICE_LISTS_QUERY = gql`
  query PriceLists($where: PriceListWhereInput = {}, $take: Int, $skip: Int) {
    priceLists(where: $where, orderBy: [{ createdAt: desc }], take: $take, skip: $skip) {
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
        currencyCode
      }
      createdAt
    }
    priceListsCount(where: $where)
  }
`;

export default function PriceListsPage() {
  const [searchParams, setSearchParams] = React.useState({
    where: {},
    take: 20,
    skip: 0,
  });

  const { data, loading, error } = useQuery(PRICE_LISTS_QUERY, {
    variables: searchParams,
  });

  return (
    <div className="flex h-full flex-col gap-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Price Lists</h1>
          <p className="text-sm text-zinc-500">
            Manage prices for different markets and customer groups
          </p>
        </div>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Price List
        </Button>
      </div>

      <PriceListTable 
        priceLists={data?.priceLists || []}
        isLoading={loading}
        error={error}
        onPageChange={(page) => {
          setSearchParams(prev => ({
            ...prev,
            skip: (page - 1) * prev.take
          }));
        }}
        total={data?.priceListsCount || 0}
      />
    </div>
  );
} 