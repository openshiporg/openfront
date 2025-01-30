"use client";

import { useRouter } from "next/navigation";
import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { ShippingProfileForm } from "../../components/ShippingProfileForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@ui/breadcrumb";

const GET_SHIPPING_PROFILE = gql`
  query GetShippingProfile($id: ID!) {
    shippingProfile(where: { id: $id }) {
      id
      name
      type
      description
      products {
        id
        title
      }
      metadata
    }
  }
`;

export default function EditShippingProfilePage({ params }) {
  const router = useRouter();
  const { data, loading, error } = useQuery(GET_SHIPPING_PROFILE, {
    variables: { id: params.id },
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading shipping profile</div>;
  }

  if (!data?.shippingProfile) {
    return <div>Shipping profile not found</div>;
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
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/platform/shipping/profiles">
                Shipping Profiles
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Edit {data.shippingProfile.name}</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mt-4">
          <h1 className="text-2xl font-bold">Edit Shipping Profile</h1>
          <p className="text-sm text-muted-foreground">
            Update the details of this shipping profile
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <ShippingProfileForm
          profile={data.shippingProfile}
          onSuccess={() => {
            router.push("/dashboard/platform/shipping/profiles");
          }}
        />
      </div>
    </div>
  );
}