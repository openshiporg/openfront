"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  Container,
  Mail,
  MapPin,
  Phone,
  User,
  Building,
  ShoppingBag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";


interface ExtendedOrder {
  id: string;
  displayId: string;
  status: string;
  email: string;
  createdAt: string;
  subtotal?: string;
  shipping?: string;
  tax?: string;
  total?: string;
  formattedTotalPaid?: string;
  paymentDetails?: Array<{
    status: string;
  }>;
  user?: {
    id: string;
    name?: string;
    email: string;
    phone?: string;
    orders?: { id: string }[];
  };
  shippingAddress?: {
    id: string;
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    postalCode: string;
    phone?: string;
    country?: { name: string };
  };
  lineItems?: Array<{
    id: string;
    title: string;
    quantity: number;
    sku?: string;
    thumbnail?: string;
    formattedUnitPrice?: string;
    formattedTotal?: string;
    variantTitle?: string;
    variantData?: any;
    productData?: any;
  }>;
  events?: Array<{
    id: string;
    type: string;
    createdAt: string;
    user?: { name: string };
  }>;
}

interface OrderPageClientProps {
  order: ExtendedOrder;
  listKey: string;
  id?: string;
  fieldModes?: Record<string, unknown>;
  fieldPositions?: Record<string, unknown>;
  uiConfig?: Record<string, unknown>;
}

export function OrderPageClient({
  order,
  listKey,
}: OrderPageClientProps) {
  const [showComments, setShowComments] = useState(false);
  const [editDrawerConfig, setEditDrawerConfig] = useState<{
    open: boolean;
    listKey: string;
    itemId: string;
    fields?: string[];
  }>({
    open: false,
    listKey: '',
    itemId: '',
    fields: undefined,
  });

  if (!order) {
    return (
      <Badge color="rose" className="items-start gap-4 border p-4">
        <AlertCircle className="h-5 w-5" />
        <div className="flex flex-col">
          <h2 className="uppercase tracking-wide font-medium">Not Found</h2>
          <span>Order not found or you don&apos;t have access.</span>
        </div>
      </Badge>
    );
  }

  const { lineItems = [] } = order;

  return (
    <div className="bg-muted/5">
      <div className="max-w-6xl p-4 md:p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Button variant="link" className="p-0 h-5">
              <Link
                href="/dashboard/platform/orders"
                className="flex items-center text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Orders
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-semibold">Order Details</h1>
          <p className="text-sm text-muted-foreground">
            Order #{order.displayId} •{" "}
            {order.createdAt ? new Date(order.createdAt).toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }) : "No date"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {/* Line Items Card */}
            <Card className="bg-muted/10">
              <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b">
                <CardTitle className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
                  Line Items
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="py-2 px-3 divide-y">
                  {lineItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start space-x-4 py-3 p-2"
                    >
                      <div className="h-16 w-16 bg-muted/10 rounded-md flex-shrink-0 flex items-center justify-center">
                        {item.thumbnail ? (
                          <Image
                            src={item.thumbnail}
                            alt={item.title}
                            width={64}
                            height={64}
                            className="object-cover rounded-md"
                          />
                        ) : (
                          <div className="h-16 w-16 bg-muted rounded-md" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col">
                          <div className="flex flex-col">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div>
                                  <span className="font-medium text-sm">
                                    {item.title}
                                  </span>
                                  {item.variantTitle && (
                                    <div className="text-xs text-muted-foreground">
                                      {item.variantTitle}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  {item.sku && (
                                    <p className="text-xs text-muted-foreground">
                                      SKU: {item.sku}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-xs text-muted-foreground whitespace-nowrap">
                                  {item.quantity} × {item.formattedUnitPrice}
                                </div>
                                <div className="text-sm font-medium whitespace-nowrap">
                                  {item.formattedTotal}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end p-4 border-t">
                  <Link href={`/dashboard/platform/orders/${order.id}/fulfill`}>
                    <Button className="group relative pe-11" size="sm">
                      Fulfill Items
                      <span className="pointer-events-none absolute inset-y-0 end-0 flex w-8 items-center justify-center bg-primary-foreground/15">
                        <Container
                          className="opacity-60"
                          size={14}
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                      </span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Payment Card */}
            <Card className="bg-muted/10">
              <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b">
                <CardTitle className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
                  {order.paymentDetails?.[0]?.status === "captured"
                    ? "Payment Complete"
                    : "Payment Processing"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-3 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span>{order.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{order.shipping}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax Total</span>
                    <span>{order.tax}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{order.total}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Total Paid</span>
                    <span>{order.formattedTotalPaid}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Log Card */}
            <Card className="overflow-hidden bg-muted/10">
              <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b">
                <CardTitle className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
                  Activity Log
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="show-comments" 
                    checked={showComments}
                    onCheckedChange={(checked) => setShowComments(checked === true)}
                  />
                  <label htmlFor="show-comments" className="text-sm">
                    Include Notes
                  </label>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-3">
                <div className="space-y-4">
                  {order.events?.filter((event) =>
                    showComments ? true : event.type !== 'NOTE_ADDED'
                  ).map((event) => (
                    <div key={event.id} className="flex gap-4 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium">{event.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.createdAt ? new Date(event.createdAt).toLocaleString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          }) : "No date"}
                          {event.user?.name && ` by ${event.user.name}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* Customer Card */}
            <Card className="bg-muted/10">
              <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b">
                <CardTitle className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 text-foreground/75">
                    <User className="h-4 w-4" />
                    <span className="text-sm">{order.user?.name || "Guest"}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-foreground/75">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">
                      {order.user?.phone || "No phone number"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-foreground/75">
                    <ShoppingBag className="h-4 w-4" />
                    <span className="text-sm">
                      {order.user?.orders?.length || 1} Order
                      {order.user?.orders?.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information Card */}
            <Card className="bg-muted/10">
              <CardHeader className="flex flex-row items-center justify-between px-4 py-2 border-b">
                <CardTitle className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
                  Contact Information
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-muted-foreground h-6 font-semibold text-[11px] uppercase px-1.5 tracking-wide"
                  onClick={() => setEditDrawerConfig({
                    open: true,
                    listKey: "users",
                    itemId: order.user?.id as string,
                    fields: ["email"]
                  })}
                >
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 text-foreground/75">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{order.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address Card */}
            <Card className="bg-muted/10">
              <CardHeader className="flex flex-row items-center justify-between px-4 py-2 border-b">
                <CardTitle className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
                  Shipping Address
                </CardTitle>
                {order.shippingAddress?.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-muted-foreground h-6 font-semibold text-[11px] uppercase px-1.5 tracking-wide"
                    onClick={() => setEditDrawerConfig({
                      open: true,
                      listKey: "addresses",
                      itemId: order.shippingAddress!.id as string,
                      fields: [
                        "firstName",
                        "lastName", 
                        "company",
                        "address1",
                        "address2",
                        "city",
                        "province",
                        "postalCode",
                        "country",
                        "phone"
                      ]
                    })}
                  >
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-4">
                {order.shippingAddress ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 text-foreground/75">
                      <User className="h-4 w-4" />
                      <span className="text-sm">
                        {[
                          order.shippingAddress.firstName,
                          order.shippingAddress.lastName,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      </span>
                    </div>
                    {order.shippingAddress.company && (
                      <div className="flex items-center space-x-3 text-foreground/75">
                        <Building className="h-4 w-4" />
                        <span className="text-sm">
                          {order.shippingAddress.company}
                        </span>
                      </div>
                    )}
                    <div className="flex items-start space-x-3 text-foreground/75">
                      <MapPin className="h-4 w-4" />
                      <div className="flex flex-col text-sm">
                        <span>{order.shippingAddress.address1}</span>
                        {order.shippingAddress.address2 && (
                          <span>{order.shippingAddress.address2}</span>
                        )}
                        <span>
                          {[
                            order.shippingAddress.city,
                            order.shippingAddress.province,
                            order.shippingAddress.postalCode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                        {order.shippingAddress.country?.name && (
                          <span>{order.shippingAddress.country.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No shipping address
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Billing Address Card */}
            <Card className="bg-muted/10">
              <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b">
                <CardTitle className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
                  Billing Address
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-foreground/75">
                  Same as shipping address
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Single Edit Drawer */}
      {editDrawerConfig.open && editDrawerConfig.itemId && (
        <EditItemDrawerClientWrapper
          listKey={editDrawerConfig.listKey}
          itemId={editDrawerConfig.itemId}
          open={editDrawerConfig.open}
          onClose={() => setEditDrawerConfig({ ...editDrawerConfig, open: false })}
        />
      )}
    </div>
  );
} 