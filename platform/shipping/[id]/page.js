"use client";

import { useRouter } from "next/navigation";
import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { ShippingOptionForm } from "../components/ShippingOptionForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@ui/breadcrumb";

const GET_SHIPPING_OPTION = gql`
  query GetShippingOption($id: ID!) {
    shippingOption(where: { id: $id }) {
      id
      name
      regionId
      providerId
      profileId
      price
      adminOnly
      requirements {
        id
        type
        minSubtotal
        maxSubtotal
        minItems
        maxItems
      }
      taxRates {
        id
      }
    }
  }
`;

export default function EditShippingOptionPage({ params }) {
  const router = useRouter();
  const { data, loading, error } = useQuery(GET_SHIPPING_OPTION, {
    variables: { id: params.id },
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading shipping option</div>;
  }

  if (!data?.shippingOption) {
    return <div>Shipping option not found</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/oms">OMS</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/platform/shipping">Shipping</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Edit {data.shippingOption.name}</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mt-4">
          <h1 className="text-2xl font-bold">Edit Shipping Option</h1>
          <p className="text-sm text-muted-foreground">
            Update the details of this shipping option
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <ShippingOptionForm
          shippingOption={data.shippingOption}
          onSuccess={() => {
            router.push("/dashboard/platform/shipping");
          }}
        />
      </div>
    </div>
  );
}