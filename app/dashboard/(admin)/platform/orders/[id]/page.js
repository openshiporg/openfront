"use client";

import React, { Fragment, useCallback, useMemo, useState } from "react";
import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { makeDataGetter } from "@keystone-6/core/admin-ui/utils";
import { useList } from "@keystone/keystoneProvider";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Circle,
  Clock,
  Copy,
  MoreHorizontal,
  Printer,
  PencilIcon,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Building,
  ShoppingBag,
  ChevronRight,
  Container,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
import { Button } from "@ui/button";
import { Progress } from "@ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@ui/dialog";
import { GraphQLErrorNotice } from "@keystone/themes/Tailwind/orion/components/GraphQLErrorNotice";
import { useUpdateItem } from "@keystone/themes/Tailwind/orion/components/EditItemDrawer";
import {
  deserializeValue,
  useChangedFieldsAndDataForUpdate,
  useInvalidFields,
} from "@keystone-6/core/admin-ui/utils";
import Link from "next/link";
import Image from "next/image";
import { Separator } from "@ui/separator";
import { Checkbox } from "@ui/checkbox";
import { Badge } from "@ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { useCreateItem } from "@keystone/utils/useCreateItem";
import { PageBreadcrumbs } from "@keystone/themes/Tailwind/orion/components/PageBreadcrumbs";
import { Fields } from "@keystone/themes/Tailwind/orion/components/Fields";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@ui/tooltip";
import { cn } from "@keystone/utils/cn";

export function getFilteredProps(props, modifications, defaultCollapse) {
  const fieldKeysToShow = modifications.map((mod) => mod.key);
  const breakGroups = modifications.reduce((acc, mod) => {
    if (mod.breakGroup) {
      acc.push(mod.breakGroup);
    }
    return acc;
  }, []);

  const newFieldModes = { ...props.fieldModes };

  Object.keys(props.fields).forEach((key) => {
    if (!fieldKeysToShow.includes(key)) {
      newFieldModes[key] = "hidden";
    } else {
      newFieldModes[key] = props.fieldModes[key] || "edit";
    }
  });

  const updatedFields = Object.keys(props.fields).reduce((obj, key) => {
    const modification = modifications.find((mod) => mod.key === key);
    if (modification) {
      obj[key] = {
        ...props.fields[key],
        fieldMeta: {
          ...props.fields[key].fieldMeta,
          ...modification.fieldMeta,
        },
      };
    } else {
      obj[key] = props.fields[key];
    }
    return obj;
  }, {});

  const reorderedFields = modifications.reduce((obj, mod) => {
    obj[mod.key] = updatedFields[mod.key];
    return obj;
  }, {});

  const updatedGroups = props.groups.map((group) => {
    if (breakGroups.includes(group.label)) {
      return {
        ...group,
        fields: group.fields.filter(
          (field) => !fieldKeysToShow.includes(field.path)
        ),
      };
    }
    return {
      ...group,
      collapsed: defaultCollapse,
    };
  });

  return {
    ...props,
    fields: reorderedFields,
    fieldModes: newFieldModes,
    groups: updatedGroups,
  };
}

function getProgressValue(status) {
  switch (status) {
    case "pending":
      return 25;
    case "processing":
      return 50;
    case "shipped":
      return 75;
    case "completed":
      return 100;
    default:
      return 0;
  }
}

export function EditDialog({
  title,
  listKey = "Order",
  id,
  modifications,
  children,
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const list = useList(listKey);
  const { handleUpdate, updateLoading, updateError } = useUpdateItem(listKey);

  const { data, error, loading } = useQuery(
    gql`
      query ($id: ID!) {
        item: ${list.gqlNames.itemQueryName}(where: { id: $id }) {
          id
          ${Object.keys(list.fields)
            .map((field) => list.fields[field].controller.graphqlSelection)
            .join("\n")}
        }
      }
    `,
    { variables: { id } }
  );

  const itemGetter = useMemo(
    () => makeDataGetter(data, error?.graphQLErrors).get("item"),
    [data, error]
  );

  const [state, setValue] = useState(() => ({
    value: deserializeValue(list.fields, itemGetter),
    item: itemGetter,
  }));

  if (data && state.item.data !== itemGetter.data) {
    setValue({
      value: deserializeValue(list.fields, itemGetter),
      item: itemGetter,
    });
  }

  const filteredProps = useMemo(() => {
    // Initialize fieldModes for all fields as edit by default
    const initialFieldModes = {};
    Object.keys(list.fields).forEach((key) => {
      initialFieldModes[key] = "edit";
    });

    // If no modifications provided, show all fields
    if (!modifications) {
      return {
        fields: list.fields,
        fieldModes: initialFieldModes,
        groups: list.groups || [],
      };
    }

    // Create a filtered version of the fields object
    const filteredFields = {};
    modifications.forEach((mod) => {
      if (list.fields[mod.key]) {
        filteredFields[mod.key] = list.fields[mod.key];
      }
    });

    return getFilteredProps(
      {
        fields: filteredFields,
        fieldModes: initialFieldModes,
        groups: list.groups || [],
      },
      modifications,
      true
    );
  }, [list.fields, list.groups, modifications]);

  // Filter the state value to only include the fields we want to show
  const filteredValue = useMemo(() => {
    const newValue = {};
    Object.keys(filteredProps.fields).forEach((key) => {
      if (state.value[key] !== undefined) {
        newValue[key] = state.value[key];
      }
    });
    return newValue;
  }, [state.value, filteredProps.fields]);

  const { changedFields, dataForUpdate } = useChangedFieldsAndDataForUpdate(
    filteredProps.fields,
    state.item,
    filteredValue
  );
  const invalidFields = useInvalidFields(filteredProps.fields, filteredValue);

  const handleSave = async () => {
    if (invalidFields.size === 0) {
      await handleUpdate(id, dataForUpdate);
      setIsDialogOpen(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="outline"
            size="icon"
            className="[&_svg]:size-3 w-6 h-6"
          >
            <PencilIcon />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="gap-0 p-0 max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b border-border px-6 py-4 text-base">
            {title}
          </DialogTitle>
        </DialogHeader>
        {loading ? null : (
          <>
            {updateError && (
              <GraphQLErrorNotice
                networkError={updateError?.networkError}
                errors={updateError?.graphQLErrors}
              />
            )}
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-4">
                <Fields
                  fields={filteredProps.fields}
                  groups={filteredProps.groups}
                  fieldModes={filteredProps.fieldModes}
                  value={filteredValue}
                  forceValidation={false}
                  invalidFields={invalidFields}
                  onChange={(value) => {
                    setValue((prev) => ({
                      ...prev,
                      value: {
                        ...prev.value,
                        ...value(filteredValue),
                      },
                    }));
                  }}
                />
              </div>
            </div>
          </>
        )}
        <DialogFooter className="border-t border-border px-6 py-4 sm:items-center">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            onClick={handleSave}
            disabled={updateLoading || !changedFields.size}
            isLoading={updateLoading}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function OrderPage({ params }) {
  const list = useList("Order");

  const { query, selectedFields } = useMemo(() => {
    const selectedFields = `
      id
      displayId
      status
      fulfillmentStatus
      total
      subtotal
      shipping
      tax
      note
      currency {
        code
        symbol
        name
      }
      metadata
      email
      createdAt
      updatedAt
      canceledAt
      paymentDetails
      totalPaid
      formattedTotalPaid
      lineItems {
        id
        quantity
        title
        sku
        thumbnail
        metadata
        variantTitle
        formattedUnitPrice
        formattedTotal
        productData
        variantData
      }
      fulfillments {
        id
        createdAt
        fulfillmentItems {
          id
          quantity
          lineItem {
            id
            quantity
            title
            sku
            thumbnail
            metadata
            variantTitle
            formattedUnitPrice
            formattedTotal
            productData
            variantData
          }
        }
        shippingLabels {
          id
          labelUrl
          trackingNumber
          trackingUrl
          carrier
        }
      }
      unfulfilled
      user {
        id
        name
        email
        phone
        orders {
          id
        }
      }
      billingAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        phone
        country {
          name
        }
      }
      shippingAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        phone
        country {
          name
        }
      }
      events {
        id
        type
        data
        time
        createdAt
        user {
          id
          name
          email
        }
      }
    `;

    return {
      selectedFields,
      query: gql`
        query ItemPage($id: ID!, $listKey: String!) {
          item: ${list.gqlNames.itemQueryName}(where: {id: $id}) {
            ${selectedFields}
          }
          keystone {
            adminMeta {
              list(key: $listKey) {
                hideCreate
                hideDelete
                fields {
                  path
                  itemView(id: $id) {
                    fieldMode
                    fieldPosition
                  }
                }
              }
            }
          }
        }
      `,
    };
  }, [list]);

  const { data, error, loading } = useQuery(query, {
    variables: { id: params.id, listKey: "Order" },
    errorPolicy: "all",
  });

  const dataGetter = makeDataGetter(data, error?.graphQLErrors);
  const order = data?.item;

  if (loading) return null;
  if (error?.graphQLErrors.length || error?.networkError) {
    return (
      <GraphQLErrorNotice
        errors={error?.graphQLErrors}
        networkError={error?.networkError}
      />
    );
  }
  if (!order) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Not Found</AlertTitle>
        <AlertDescription>
          Order not found or you don&apos;t have access.
        </AlertDescription>
      </Alert>
    );
  }

  const { lineItems = [] } = order;

  return (
    <>
      <PageBreadcrumbs
        items={[
          {
            type: "link",
            label: "Dashboard",
            href: "/",
          },
          {
            type: "page",
            label: "Platform",
            showModelSwitcher: true,
            switcherType: "platform",
          },
          {
            type: "link",
            label: "Orders",
            href: "/platform/orders",
          },
          {
            type: "page",
            label: `#${order.displayId}`,
          },
        ]}
      />
      <main className="w-full max-w-4xl p-4 md:p-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Button variant="link" className="px-0">
                <Link
                  href="/dashboard/platform/orders"
                  className="flex items-center text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>
            </div>
            <h1 className="text-2xl font-semibold">Order Details</h1>
            <p className="text-sm text-muted-foreground">
              Order #{order.displayId} •{" "}
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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

            <Card className="bg-muted/10">
              <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b">
                <CardTitle className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
                  {order.paymentDetails?.[0]?.status === "captured"
                    ? "Payment Complete"
                    : "Payment Processing"}
                  {order.payments?.[0]?.paymentLink && (
                    <Button variant="link" size="sm" className="ml-2" asChild>
                      <a
                        href={order.payments[0].paymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Transaction
                      </a>
                    </Button>
                  )}
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

            <Card className="overflow-hidden bg-muted/10">
              <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b">
                <CardTitle className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
                  Activity Log
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Checkbox id="show-comments" />
                  <label htmlFor="show-comments" className="text-sm">
                    Include Notes
                  </label>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-3">
                <div className="space-y-4">
                  {order.events?.map((event) => (
                    <div key={event.id} className="flex gap-4 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium">{event.type}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {new Date(event.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}{" "}
                          at{" "}
                          {new Date(event.createdAt).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "numeric",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
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
                    <span className="text-sm">
                      {order.user?.name || "Guest"}
                    </span>
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

            <Card className="bg-muted/10">
              <CardHeader className="flex flex-row items-center justify-between px-4 py-2 border-b">
                <CardTitle className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
                  Contact Information
                </CardTitle>
                <EditDialog
                  title="Edit Contact Information"
                  id={order.id}
                  modifications={[{ key: "email" }]}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-muted-foreground h-6 font-semibold text-[11px] uppercase px-1.5 tracking-wide"
                  >
                    Edit
                  </Button>
                </EditDialog>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 text-foreground/75">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">
                      {order.email}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/10">
              <CardHeader className="flex flex-row items-center justify-between px-4 py-2 border-b">
                <CardTitle className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
                  Shipping Address
                </CardTitle>
                <EditDialog
                  title="Edit Shipping Address"
                  listKey="Address"
                  id={order.shippingAddress?.id}
                  // modifications={[
                  //   { key: "" }
                  // ]}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-muted-foreground h-6 font-semibold text-[11px] uppercase px-1.5 tracking-wide"
                  >
                    Edit
                  </Button>
                </EditDialog>
              </CardHeader>
              <CardContent className="p-4">
                {order.shippingAddress ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 text-foreground/75">
                      <User className="h-4 w-4" />
                      <span className="text-sm">
                        {order.shippingAddress.firstName}{" "}
                        {order.shippingAddress.lastName}
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
                          {order.shippingAddress.city},{" "}
                          {order.shippingAddress.province}{" "}
                          {order.shippingAddress.postalCode}
                        </span>
                        <span>{order.shippingAddress.country.name}</span>
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

            <Card className="bg-muted/10">
              <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b">
                <CardTitle className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
                  Billing Address
                </CardTitle>
                {/* <EditDialog
                  title="Edit Billing Address"
                  id={order.id}
                  modifications={[
                    { key: "billingAddress" }
                  ]}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-muted-foreground h-6 font-semibold text-[11px] uppercase px-1.5 tracking-wide"
                  >
                    Edit
                  </Button>
                </EditDialog> */}
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-foreground/75">
                  Same as shipping address
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
