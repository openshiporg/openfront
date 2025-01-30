import React from "react";
import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { DiscountList } from "./components/DiscountList";
import { Button } from "@ui/button";
import { PlusIcon } from "lucide-react";

const DISCOUNTS_LIST_QUERY = gql`
  query DiscountsList($where: DiscountWhereInput, $take: Int, $skip: Int) {
    discounts(where: $where, orderBy: [{ createdAt: desc }], take: $take, skip: $skip) {
      id
      code
      type
      value
      startsAt
      endsAt
      usageLimit
      usageCount
      status
      conditions {
        id
        type
        value
      }
    }
    discountsCount(where: $where)
  }
`;

export default function DiscountsPage() {
  const [searchParams, setSearchParams] = React.useState({
    where: {},
    take: 20,
    skip: 0,
  });

  const { data, loading, error } = useQuery(DISCOUNTS_LIST_QUERY, {
    variables: searchParams,
  });

  return (
    <div className="flex h-full flex-col gap-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Discounts</h1>
          <p className="text-sm text-zinc-500">
            Manage promotional discounts and offers
          </p>
        </div>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Discount
        </Button>
      </div>

      <DiscountList 
        discounts={data?.discounts || []}
        isLoading={loading}
        error={error}
        onPageChange={(page) => {
          setSearchParams(prev => ({
            ...prev,
            skip: (page - 1) * prev.take
          }));
        }}
        total={data?.discountsCount || 0}
      />
    </div>
  );
} 