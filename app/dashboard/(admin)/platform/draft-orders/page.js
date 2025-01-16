import React from "react";
import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { DraftOrderList } from "./components/DraftOrderList";
import { Button } from "@ui/button";
import { PlusIcon } from "lucide-react";

const DRAFT_ORDERS_QUERY = gql`
  query DraftOrders($where: DraftOrderWhereInput = {}, $take: Int, $skip: Int) {
    draftOrders(where: $where, orderBy: [{ createdAt: desc }], take: $take, skip: $skip) {
      id
      status
      displayId
      cart {
        id
        email
        total
        items {
          id
          title
          quantity
          unitPrice
        }
      }
      order {
        id
        status
      }
      noNotificationOrder
      createdAt
      updatedAt
    }
    draftOrdersCount(where: $where)
  }
`;

export default function DraftOrdersPage() {
  const [searchParams, setSearchParams] = React.useState({
    where: {},
    take: 20,
    skip: 0,
  });

  const { data, loading, error } = useQuery(DRAFT_ORDERS_QUERY, {
    variables: searchParams,
  });

  return (
    <div className="flex h-full flex-col gap-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Draft Orders</h1>
          <p className="text-sm text-zinc-500">
            Create and manage draft orders
          </p>
        </div>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Draft Order
        </Button>
      </div>

      <DraftOrderList 
        draftOrders={data?.draftOrders || []}
        isLoading={loading}
        error={error}
        onPageChange={(page) => {
          setSearchParams(prev => ({
            ...prev,
            skip: (page - 1) * prev.take
          }));
        }}
        total={data?.draftOrdersCount || 0}
      />
    </div>
  );
} 