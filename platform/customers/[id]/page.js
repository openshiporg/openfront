import React from "react";
import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { CustomerDetails } from "../components/CustomerDetails";
import { CustomerOrders } from "../components/CustomerOrders";
import { CustomerGroups } from "../components/CustomerGroups";
import { AddressBook } from "../components/AddressBook";

const USER_QUERY = gql`
  query User($where: UserWhereUniqueInput!) {
    user(where: $where) {
      id
      name
      email
      phone
      hasAccount
      metadata
      billingAddress {
        id
        address1
        address2
        city
        state
        postalCode
      }
      addresses(orderBy: [{ createdAt: desc }]) {
        id
        address1
        address2
        city
        state
        postalCode
      }
      orders(orderBy: [{ createdAt: desc }]) {
        id
        status
        total
        createdAt
      }
      customerGroups {
        id
        name
      }
    }
  }
`;

export default function CustomerPage({ params }) {
  const { data, loading } = useQuery(USER_QUERY, {
    variables: { id: params.id }
  });

  if (loading) return <div>Loading...</div>;
  if (!data?.user) return <div>Customer not found</div>;

  return (
    <div className="flex h-full flex-col gap-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold">
          {data.user.name}
        </h1>
        <p className="text-sm text-zinc-500">{data.user.email}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <CustomerDetails customer={data.user} />
          <CustomerOrders orders={data.user.orders} />
        </div>
        
        <div className="space-y-4">
          <CustomerGroups 
            groups={data.user.customerGroups}
          />
          <AddressBook 
            addresses={data.user.addresses}
          />
        </div>
      </div>
    </div>
  );
} 