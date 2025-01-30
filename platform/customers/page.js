import React from "react";
import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { CustomerList } from "./components/CustomerList";
import { Button } from "@ui/button";
import { PlusIcon } from "lucide-react";

const CUSTOMERS_LIST_QUERY = gql`
  query CustomersList($where: UserWhereInput = {}, $take: Int, $skip: Int) {
    users(where: $where, orderBy: [{ createdAt: desc }], take: $take, skip: $skip) {
      id
      email
      firstName
      lastName
      name
      phone
      hasAccount
      orders {
        id
        total
        status
      }
      customerGroups {
        id
        name
      }
      createdAt
    }
    usersCount(where: $where)
  }
`;

export default function CustomersPage() {
  const [searchParams, setSearchParams] = React.useState({
    where: {},
    take: 20,
    skip: 0,
  });

  const { data, loading, error } = useQuery(CUSTOMERS_LIST_QUERY, {
    variables: searchParams,
  });

  return (
    <div className="flex h-full flex-col gap-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-sm text-zinc-500">
            Manage your customer base
          </p>
        </div>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <CustomerList 
        customers={data?.users || []}
        isLoading={loading}
        error={error}
        onPageChange={(page) => {
          setSearchParams(prev => ({
            ...prev,
            skip: (page - 1) * prev.take
          }));
        }}
        total={data?.usersCount || 0}
      />
    </div>
  );
} 