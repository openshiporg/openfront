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
      payments {
        id
        amount
        status
        data
        metadata
        createdAt
        paymentLink
      }
      fulfillments {
        id
        data
        shippedAt
        canceledAt
        metadata
        fulfillmentItems {
          id
          quantity
        }
      }
      user {
        id
        name
        email
        phone
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
      lineItems {
        id
        quantity
        metadata
        isReturn
        isGiftcard
        total
        unitPrice
        title
        thumbnail
        description
        availableInRegion
        percentageOff
        originalPrice
        productVariant {
          id
          title
          sku
          barcode
          ean
          upc
          product {
            id
            title
            thumbnail
            description
          }
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

  const unfulfilledItems = order.lineItems.filter(
    (item) => !item.fulfilledQuantity || item.fulfilledQuantity < item.quantity
  );

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
      <main className="w-full max-w-4xl mx-auto p-4 md:p-6 flex flex-col gap-4">
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
            {unfulfilledItems.length > 0 && (
              <Card className="bg-muted/40">
                <CardHeader className="flex flex-row items-center justify-between p-3 pb-0">
                  <CardTitle className="flex items-center gap-2 text-base">
                    Items to be fulfilled
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-3">
                  <div className="border bg-background/40 shadow-sm rounded-md">
                    {unfulfilledItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row items-start gap-2 py-2 pl-2 pr-4 [&:not(:last-child)]:border-b border-border"
                      >
                        <div className="h-16 w-16 bg-muted rounded-md flex-shrink-0 flex items-center justify-center">
                          {item.thumbnail ? (
                            <Image
                              src={item.thumbnail}
                              alt={item.title}
                              width={64}
                              height={64}
                              className="rounded-md object-cover"
                            />
                          ) : (
                            <div className="h-16 w-16 bg-muted rounded-md" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Reference: {item.productVariant?.sku || "N/A"}
                          </p>
                        </div>
                        <div className="text-right self-start sm:self-center">
                          <div className="text-sm">
                            {item.unitPrice} × {item.quantity}
                          </div>
                          <div className="font-medium">{item.total}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-4 pt-4 border-t">
                    <Link
                      href={`/dashboard/platform/orders/${order.id}/fulfill`}
                    >
                      <Button size="sm">Ship Items</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-muted/40">
              <CardHeader className="flex flex-row items-center justify-between p-3 pb-0">
                <CardTitle className="flex items-center gap-2 text-base">
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
              <CardContent className="p-3 pt-3">
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

            <Card className="overflow-hidden bg-muted/40">
              <CardHeader className="flex flex-row items-center justify-between p-3 pb-0">
                <CardTitle className="text-base">Activity Log</CardTitle>
                <div className="flex items-center gap-2">
                  <Checkbox id="show-comments" />
                  <label htmlFor="show-comments" className="text-sm">
                    Include Notes
                  </label>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-3">
                <div className="space-y-4">
                  {order.events?.map((event) => (
                    <div key={event.id} className="flex gap-4">
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
            <Card className="bg-muted/40">
              <CardHeader className="flex flex-row items-center justify-between p-3 pb-0">
                <CardTitle className="text-base">Internal Notes</CardTitle>
                <EditDialog
                  title="Update Note"
                  listKey="Order"
                  id={order.id}
                  modifications={[{ key: "note" }]}
                />
              </CardHeader>
              <CardContent className="p-3 pt-3">
                {order.note ? (
                  <div className="bg-background border shadow-inner p-3 rounded-md overflow-x-auto">
                    <p className="text-sm whitespace-pre-wrap">{order.note}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No internal notes recorded
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-muted/40">
              <CardHeader className="flex flex-row items-center justify-between p-3 pb-0">
                <CardTitle className="text-base">Customer</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-3">
                <div className="space-y-4">
                  {order.user && (
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium mb-2">Name</h4>
                        <Link
                          href={`#`}
                          className="text-primary hover:underline text-sm break-all"
                        >
                          {order.user.name}
                        </Link>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium mb-2">Email</h4>
                      <Link
                        href={`mailto:${order.email}`}
                        className="text-primary hover:underline text-sm break-all"
                      >
                        {order.email}
                      </Link>
                    </div>
                    <EditDialog
                      title="Update Contact"
                      listKey="Order"
                      id={order.id}
                      modifications={[{ key: "email" }]}
                    />
                  </div>
                  {order.shippingAddress && (
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium mb-2">Shipping Address</h4>
                        <div className="text-sm space-y-1">
                          <p>
                            {order.shippingAddress.firstName}{" "}
                            {order.shippingAddress.lastName}
                          </p>
                          <p>{order.shippingAddress.address1}</p>
                          {order.shippingAddress.address2 && (
                            <p>{order.shippingAddress.address2}</p>
                          )}
                          <p>
                            {order.shippingAddress.city}
                            {order.shippingAddress.province &&
                              `, ${order.shippingAddress.province}`}{" "}
                            {order.shippingAddress.postalCode}
                          </p>
                          <p>{order.shippingAddress.country?.name}</p>
                          <p>{order.shippingAddress.phone}</p>
                        </div>
                      </div>
                      <EditDialog
                        title="Update Address"
                        listKey="Address"
                        id={order.shippingAddress.id}
                        modifications={[
                          { key: "firstName" },
                          { key: "lastName" },
                          { key: "company" },
                          { key: "address1" },
                          { key: "address2" },
                          { key: "city" },
                          { key: "province" },
                          { key: "postalCode" },
                          { key: "country" },
                          { key: "phone" },
                        ]}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
