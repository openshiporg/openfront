"use client";

import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { ShippingProfileList } from "../components/ShippingProfileList";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@ui/breadcrumb";

const GET_SHIPPING_PROFILES = gql`
  query GetShippingProfiles($skip: Int, $take: Int) {
    shippingProfiles(skip: $skip, take: $take) {
      id
      name
      type
      description
      products {
        id
        title
      }
      shippingOptions {
        id
        name
      }
    }
    shippingProfilesCount
  }
`;

export default function ShippingProfilesPage() {
  const { data, loading, error, refetch } = useQuery(GET_SHIPPING_PROFILES, {
    variables: {
      skip: 0,
      take: 10,
    },
  });

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
            <BreadcrumbItem>Shipping Profiles</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mt-4">
          <h1 className="text-2xl font-bold">Shipping Profiles</h1>
          <p className="text-sm text-muted-foreground">
            Manage shipping profiles for your products
          </p>
        </div>
      </div>

      <div>
        <ShippingProfileList
          profiles={data?.shippingProfiles || []}
          isLoading={loading}
          error={error}
          onPageChange={(page) => {
            refetch({
              skip: (page - 1) * 10,
              take: 10,
            });
          }}
          total={data?.shippingProfilesCount || 0}
          onDelete={() => {
            refetch();
          }}
        />
      </div>
    </div>
  );
}