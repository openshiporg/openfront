"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import MiniStorefront from "./MiniStorefront";

export function OrderCreateButton() {
  const router = useRouter();

  const handleOrderSuccess = (orderId: string) => {
    // Navigate to the order detail page after successful creation
    router.push(`/dashboard/platform/orders/${orderId}`);
  };

  return <MiniStorefront onSuccess={handleOrderSuccess} />;
}