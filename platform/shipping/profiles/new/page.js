"use client";

import { useRouter } from "next/navigation";
import { ShippingProfileForm } from "../../components/ShippingProfileForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@ui/breadcrumb";

export default function NewShippingProfilePage() {
  const router = useRouter();

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
            <BreadcrumbItem>New Profile</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mt-4">
          <h1 className="text-2xl font-bold">Create Shipping Profile</h1>
          <p className="text-sm text-muted-foreground">
            Create a new shipping profile for your products
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <ShippingProfileForm
          onSuccess={() => {
            router.push("/dashboard/platform/shipping/profiles");
          }}
        />
      </div>
    </div>
  );
}