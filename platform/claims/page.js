import React from "react";
import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { ClaimList } from "./components/ClaimList";
import { Button } from "@ui/button";
import { PlusIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";

const CLAIMS_QUERY = gql`
  query Claims($where: ClaimOrderWhereInput = {}, $take: Int, $skip: Int) {
    claimOrders(where: $where, orderBy: [{ createdAt: desc }], take: $take, skip: $skip) {
      id
      type
      status
      order {
        id
        displayId
      }
      claimItems {
        id
        item {
          id
          title
          thumbnail
        }
        quantity
        reason {
          id
          label
        }
      }
      additionalItems {
        id
        title
        quantity
      }
      shippingAddress {
        address1
        city
        country {
          id
          iso2
        }
      }
      shippingMethod {
        id
        name
      }
      refund {
        id
        amount
      }
      createdAt
    }
    claimOrdersCount(where: $where)
  }
`;

export default function ClaimsPage() {
  const [searchParams, setSearchParams] = React.useState({
    where: {},
    take: 20,
    skip: 0,
  });

  const { data, loading, error } = useQuery(CLAIMS_QUERY, {
    variables: searchParams,
  });

  const handleStatusFilter = (status) => {
    setSearchParams(prev => ({
      ...prev,
      where: status === "all" ? {} : { status: { equals: status } },
      skip: 0,
    }));
  };

  return (
    <div className="flex h-full flex-col gap-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Claims</h1>
          <p className="text-sm text-zinc-500">
            Manage order claims and replacements
          </p>
        </div>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Claim
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={handleStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">All Claims</TabsTrigger>
          <TabsTrigger value="created">Created</TabsTrigger>
          <TabsTrigger value="received">Received</TabsTrigger>
          <TabsTrigger value="fulfilled">Fulfilled</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <ClaimList 
            claims={data?.claimOrders || []}
            isLoading={loading}
            error={error}
            onPageChange={(page) => {
              setSearchParams(prev => ({
                ...prev,
                skip: (page - 1) * prev.take
              }));
            }}
            total={data?.claimOrdersCount || 0}
          />
        </TabsContent>

        {["created", "received", "fulfilled", "shipped", "cancelled"].map((status) => (
          <TabsContent key={status} value={status} className="mt-4">
            <ClaimList 
              claims={data?.claimOrders || []}
              isLoading={loading}
              error={error}
              onPageChange={(page) => {
                setSearchParams(prev => ({
                  ...prev,
                  skip: (page - 1) * prev.take
                }));
              }}
              total={data?.claimOrdersCount || 0}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 