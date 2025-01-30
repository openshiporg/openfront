import React from "react";
import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { DiscountForm } from "../components/DiscountForm";
import { ConditionBuilder } from "../components/ConditionBuilder";
import { DiscountRules } from "../components/DiscountRules";
import { UsageStats } from "../components/UsageStats";

const DISCOUNT_QUERY = gql`
  query Discount($where: DiscountWhereUniqueInput!) {
    discount(where: $where) {
      id
      code
      type
      value
      startsAt
      endsAt
      usageLimit
      usageCount
      status
      metadata
      regions {
        id
        name
      }
      conditions {
        id
        type
        operator
        value
      }
      rules {
        id
        type
        value
      }
    }
  }
`;

const UPDATE_DISCOUNT_MUTATION = gql`
  mutation UpdateDiscount($where: DiscountWhereUniqueInput!, $data: DiscountUpdateInput!) {
    updateDiscount(where: $where, data: $data) {
      id
      code
      status
    }
  }
`;

export default function DiscountPage({ params }) {
  const { data, loading } = useQuery(DISCOUNT_QUERY, {
    variables: { id: params.id }
  });

  if (loading) return <div>Loading...</div>;
  if (!data?.discount) return <div>Discount not found</div>;

  return (
    <div className="flex h-full flex-col gap-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold">Edit Discount</h1>
        <p className="text-sm text-zinc-500">Code: {data.discount.code}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <DiscountForm discount={data.discount} />
          <ConditionBuilder conditions={data.discount.conditions} />
        </div>
        
        <div className="space-y-4">
          <DiscountRules rules={data.discount.rules} />
          <UsageStats stats={data.discount.usage} />
        </div>
      </div>
    </div>
  );
} 