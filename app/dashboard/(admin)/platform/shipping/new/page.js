"use client";

import { useRouter } from "next/navigation";
import { ShippingOptionForm } from "../components/ShippingOptionForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@ui/breadcrumb";

export default function NewShippingOptionPage() {
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
            <BreadcrumbItem>New Shipping Option</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mt-4">
          <h1 className="text-2xl font-bold">Create Shipping Option</h1>
          <p className="text-sm text-muted-foreground">
            Create a new shipping option for your store
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <ShippingOptionForm
          onSuccess={() => {
            router.push("/dashboard/platform/shipping");
          }}
        />
      </div>
    </div>
  );
}