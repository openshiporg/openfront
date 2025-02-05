"use client";

import { useState, useMemo, useId } from "react";
import {
  ArrowLeft,
  Info,
  Package,
  ChevronDown,
  ChevronUp,
  PencilIcon,
  Trash2,
  Tag,
  ScanBarcode,
  Plus,
  Truck,
  Box,
  CreditCard,
  Download,
  Copy,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  gql,
  useQuery,
  useApolloClient,
} from "@keystone-6/core/admin-ui/apollo";
import { useList } from "@keystone/keystoneProvider";
import { useCreateItem } from "@keystone/utils/useCreateItem";
import { useRouter } from "next/navigation";

import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { Checkbox } from "@ui/checkbox";

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
import { Alert, AlertDescription } from "@ui/alert";
import { useDeleteItem } from "@keystone/themes/Tailwind/orion/components/EditItemDrawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";
import {
  DynamicTabs,
  DynamicTabsContent,
  DynamicTabsList,
  DynamicTabsTrigger,
} from "@ui/dynamic-tabs";
import { executeAdapterFunction } from "@keystone/utils/shippingProviderAdapter";
import { EditDialog } from "../page";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from "@ui/select";
import { ADAPTER_FUNCTIONS } from "@keystone/utils/shippingProviderAdapter";
import { Fields } from "@keystone/themes/Tailwind/orion/components/Fields";

import { useUpdateItem } from "@keystone/themes/Tailwind/orion/components/EditItemDrawer";
import { ShippingTabs } from "./components/ShippingTabs";
import { PageBreadcrumbs } from "@keystone/themes/Tailwind/orion/components/PageBreadcrumbs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@ui/toggle-group";
import { GraphQLErrorNotice } from "@keystone/themes/Tailwind/orion/components/GraphQLErrorNotice";
import { MultipleSelector } from "@keystone/themes/Tailwind/orion/primitives/default/ui/multi-select";

const GET_ORDER_QUERY = gql`
  query GetOrder($id: ID!) {
    order(where: { id: $id }) {
      id
      displayId
      createdAt
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
        country {
          name
          iso2
        }
        phone
      }
      unfulfilled
      fulfillments {
        id
        createdAt
        fulfillmentItems {
          id
          quantity
          lineItem {
            id
            title
            thumbnail
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
      fulfillmentStatus
    }
  }
`;

const GET_SHIPPING_PROVIDERS = gql`
  query GetShippingProviders {
    shippingProviders(orderBy: [{ isActive: desc }, { name: asc }]) {
      id
      name
      isActive
      metadata
      createLabelFunction
      getRatesFunction
      validateAddressFunction
      trackShipmentFunction
      cancelLabelFunction
    }
  }
`;

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

export const shippingProviders = {
  EasyPost: "easypost",
  Shippo: "shippo",
  ShipEngine: "shipengine",
  ShipStation: "soon",
};

export function CreateDialog({ title, listKey, children }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(undefined);
  const list = useList(listKey);
  const { create, props, state, error } = useCreateItem(list);

  const handleProviderSelection = (value) => {
    setSelectedProvider(value);
    if (value === "custom") {
      clearFields();
    } else {
      props.onChange((oldValues) => {
        const newValues = { ...oldValues };
        [
          "name",
          "accessToken",
          "createLabelFunction",
          "getRatesFunction",
          "validateAddressFunction",
          "trackShipmentFunction",
          "cancelLabelFunction",
        ]
          .filter((key) => !["accessToken"].includes(key))
          .forEach((key) => {
            newValues[key] = {
              ...oldValues[key],
              value: {
                ...oldValues[key].value,
                inner: {
                  ...oldValues[key].value.inner,
                  value:
                    key === "name"
                      ? value.charAt(0).toUpperCase() + value.slice(1)
                      : value,
                },
              },
            };
          });

        return newValues;
      });
    }
  };

  const clearFields = () => {
    props.onChange((prev) => {
      const clearedFields = {};
      [
        "name",
        "accessToken",
        "createLabelFunction",
        "getRatesFunction",
        "validateAddressFunction",
        "trackShipmentFunction",
        "cancelLabelFunction",
      ].forEach((key) => {
        clearedFields[key] = {
          ...prev[key],
          value: {
            ...prev[key].value,
            inner: {
              ...prev[key].value.inner,
              value: "",
            },
          },
        };
      });
      return { ...prev, ...clearedFields };
    });
  };

  const handleDialogClose = () => {
    setSelectedProvider(undefined);
    clearFields();
    setIsDialogOpen(false);
  };

  const filteredProps = useMemo(() => {
    const modifications =
      selectedProvider === "custom"
        ? [
            { key: "name" },
            { key: "accessToken" },
            { key: "createLabelFunction" },
            { key: "getRatesFunction" },
            { key: "validateAddressFunction" },
            { key: "trackShipmentFunction" },
            { key: "cancelLabelFunction" },
            // { key: "metadata" },
            { key: "fromAddress" },
          ]
        : [{ key: "name" }, { key: "accessToken" }, { key: "fromAddress" }];
    const result = getFilteredProps(props, modifications);
    return result;
  }, [props, selectedProvider]);

  const handleSave = async () => {
    const item = await create();
    if (item) {
      setIsDialogOpen(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="gap-0 p-0">
        <DialogHeader>
          <DialogTitle className="border-b px-6 py-4 text-base">
            <div className="flex flex-col">
              {title}
              <span className="text-sm text-muted-foreground font-normal">
                Choose the frameworks you want to work with.
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>
        {error && (
          <GraphQLErrorNotice
            networkError={error?.networkError}
            errors={error?.graphQLErrors}
          />
        )}
        <div className="px-6 py-4 space-y-4">
          <div className="space-y-2">
            <Label>Provider</Label>
            <Select
              onValueChange={handleProviderSelection}
              value={selectedProvider}
            >
              <SelectTrigger className="w-full bg-muted/40">
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel className="-ml-6">Templates</SelectLabel>
                  {Object.entries(shippingProviders).map(([key, value]) => (
                    <SelectItem
                      key={key}
                      value={value}
                      disabled={value === "soon"}
                    >
                      {key}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel className="-ml-6">Custom</SelectLabel>
                  <SelectItem value="custom">Start from scratch...</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {selectedProvider === "custom" && (
            <div className="flex items-center gap-3 px-4 py-2 text-sm text-blue-600 dark:text-blue-500 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <Info className="h-4 w-4" />
              <p className="basis-11/12">
                Each function can be configured to either use a built-in adapter
                (e.g. &apos;easypost&apos;) or a custom HTTP endpoint that will
                handle the shipping operations.
              </p>
            </div>
          )}
          {selectedProvider && (
            <div className="bg-muted/20 p-4 border rounded-lg">
              <Fields {...filteredProps} />
            </div>
          )}
        </div>
        <DialogFooter className="border-t border-border px-6 py-4 sm:items-center">
          <Button variant="outline" onClick={handleDialogClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={state === "loading" || !selectedProvider}
            isLoading={state === "loading"}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function FulfillOrder({ params }) {
  const [selectedRate, setSelectedRate] = useState(null);
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [noNotification, setNoNotification] = useState(false);
  const client = useApolloClient();

  const { data: providersData, loading: providersLoading } = useQuery(
    GET_SHIPPING_PROVIDERS
  );
  const { data, loading, error } = useQuery(GET_ORDER_QUERY, {
    variables: { id: params.id },
    onCompleted: (data) => {
      // Initialize quantities to max available for each unfulfilled item
      const initialQuantities = {};
      data.order.unfulfilled.forEach((item) => {
        initialQuantities[item.id] = item.quantity;
      });
      setSelectedQuantities(initialQuantities);
    },
  });

  const router = useRouter();

  const fulfillmentList = useList("Fulfillment");
  const { createWithData: createFulfillment, state: fulfillmentState } =
    useCreateItem(fulfillmentList);
  const { handleDelete } = useDeleteItem("Fulfillment");
  const { handleUpdate } = useUpdateItem("ShippingProvider");

  const handleProviderToggle = async (providerId) => {
    try {
      const provider = providersData.shippingProviders.find(
        (p) => p.id === providerId
      );
      if (!provider) return;

      await handleUpdate(providerId, {
        isActive: !provider.isActive,
      });

      // Refetch queries to update UI
      await client.refetchQueries({
        include: "active",
      });
    } catch (error) {
      // Handle error silently
      console.error("Failed to toggle provider status:", error);
    }
  };

  const handleDeleteFulfillment = async (id, label) => {
    const result = await handleDelete(id, label);
    if (result) {
      // Reset quantities to max available after deletion
      const { data } = await client.refetchQueries({
        include: ["GetOrder"],
      });
      if (data?.order?.unfulfilled) {
        const initialQuantities = {};
        data.order.unfulfilled.forEach((item) => {
          initialQuantities[item.id] = item.quantity;
        });
        setSelectedQuantities(initialQuantities);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const { order } = data;
  const unfulfilledItems = order.unfulfilled || [];
  const hasSelectedItems = Object.values(selectedQuantities).some(
    (qty) => parseInt(qty) > 0
  );

  const isFullyFulfilled = order.fulfillmentStatus?.status === "fulfilled";

  const handleFulfill = async () => {
    try {
      // First, validate we have items to fulfill
      const itemsToFulfill = Object.entries(selectedQuantities)
        .filter(([_, quantity]) => parseInt(quantity) > 0)
        .map(([lineItemId, quantity]) => {
          // Find the line item in unfulfilled items
          const lineItem = unfulfilledItems.find(
            (item) => item.id === lineItemId
          );
          if (!lineItem) {
            throw new Error(`Line item ${lineItemId} not found`);
          }

          // Validate quantity doesn't exceed remaining
          const requestedQuantity = parseInt(quantity);
          if (requestedQuantity > lineItem.quantity) {
            throw new Error(
              `Cannot fulfill more than ${lineItem.quantity} items for ${lineItem.title}`
            );
          }

          return {
            lineItemId,
            quantity: requestedQuantity,
            title: lineItem.title, // for error messages
          };
        });

      if (itemsToFulfill.length === 0) {
        throw new Error("No items selected for fulfillment");
      }

      // Create the fulfillment with all required relationships
      const fulfillmentData = {
        order: { connect: { id: params.id } },
        fulfillmentItems: {
          create: itemsToFulfill.map(({ lineItemId, quantity }) => ({
            lineItem: { connect: { id: lineItemId } },
            quantity,
          })),
        },
        // Add tracking info as a shipping label instead of tracking link
        ...(trackingNumber &&
          carrier && {
            shippingLabels: {
              create: [
                {
                  status: "purchased",
                  carrier,
                  trackingNumber,
                  trackingUrl:
                    carrier === "ups"
                      ? `https://www.ups.com/track?tracknum=${trackingNumber}`
                      : carrier === "usps"
                        ? `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`
                        : carrier === "fedex"
                          ? `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`
                          : carrier === "dhl"
                            ? `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`
                            : undefined,
                  metadata: {
                    source: "admin",
                  },
                },
              ],
            },
          }),
        noNotification,
        metadata: {
          source: "admin",
          createdBy: "admin",
          items: itemsToFulfill.map(({ lineItemId, quantity, title }) => ({
            id: lineItemId,
            title,
            quantity,
          })),
        },
      };

      // Create the fulfillment
      const result = await createFulfillment({ data: fulfillmentData });

      if (!result) {
        throw new Error("Failed to create fulfillment");
      }

      // Refetch all active queries to update the UI
      await client.refetchQueries({
        include: "active",
      });

      // Reset form
      setSelectedQuantities({});
      setTrackingNumber("");
      setCarrier("");
      setNoNotification(false);
    } catch (error) {
      // TODO: Show error toast/alert
    }
  };

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
            type: "link",
            label: `#${order.displayId}`,
            href: `/platform/orders/${order.id}`,
          },
          {
            type: "page",
            label: "Fulfill",
          },
        ]}
      />
      <main className="w-full max-w-4xl mx-auto p-4 md:p-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Button variant="link" className="px-0">
                <Link
                  href={`/dashboard/platform/orders/${order.id}`}
                  className="flex items-center text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>
            </div>
            <h1 className="text-2xl font-semibold">Fulfill Order</h1>
            <p className="text-sm text-muted-foreground">
              Order #{order.displayId} •{" "}
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between p-3 pb-0">
                <div>
                  <CardTitle className="text-base font-medium">
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge
                        variant="outline"
                        className="border uppercase text-xs flex items-center gap-1.5 bg-zinc-100"
                      >
                        <Package className="h-3 w-3" />
                        {(
                          order.fulfillmentStatus?.status || "unfulfilled"
                        ).replace(/_/g, " ")}
                      </Badge>
                      <span className="text-sm font-medium">
                        #{order.displayId}
                      </span>
                    </div>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-3 space-y-4">
                {isFullyFulfilled ? (
                  <div className="rounded-lg bg-muted/40 border p-4 text-center space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">
                      <Package className="h-6 w-6 text-zinc-600" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">
                        Order has been fulfilled
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        All items in this order have been fulfilled. To create a
                        new shipment, please delete an existing fulfillment
                        below.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {unfulfilledItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-4 border rounded-md p-2 shadow-xs bg-muted/40"
                      >
                        <div className="h-16 w-16 bg-muted rounded-md flex-shrink-0">
                          {item.thumbnail && (
                            <Image
                              src={item.thumbnail}
                              alt={item.title}
                              width={64}
                              height={64}
                              className="rounded-md object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            SKU: {item.sku || "N/A"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-end gap-1">
                            <div className="relative inline-flex h-7 items-center overflow-hidden whitespace-nowrap rounded-lg border border-input text-sm shadow-sm shadow-black/5">
                              <div className="flex-1 bg-background px-3 py-2 tabular-nums text-foreground">
                                {selectedQuantities[item.id] || 0}/
                                {item.quantity}
                              </div>
                              <div className="flex h-[calc(100%+2px)] flex-col">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="-me-px flex h-1/2 w-6 flex-1 items-center justify-center border border-input bg-background text-sm text-muted-foreground/80 transition-shadow hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 rounded-none"
                                  onClick={() => {
                                    const currentValue = parseInt(
                                      selectedQuantities[item.id] || 0
                                    );
                                    if (currentValue < item.quantity) {
                                      setSelectedQuantities((prev) => ({
                                        ...prev,
                                        [item.id]: currentValue + 1,
                                      }));
                                    }
                                  }}
                                >
                                  <ChevronUp
                                    className="h-3 w-3"
                                    strokeWidth={2}
                                  />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="-me-px -mt-px flex h-1/2 w-6 flex-1 items-center justify-center border border-input bg-background text-sm text-muted-foreground/80 transition-shadow hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 rounded-none"
                                  onClick={() => {
                                    const currentValue = parseInt(
                                      selectedQuantities[item.id] || 0
                                    );
                                    if (currentValue > 0) {
                                      setSelectedQuantities((prev) => ({
                                        ...prev,
                                        [item.id]: currentValue - 1,
                                      }));
                                    }
                                  }}
                                >
                                  <ChevronDown
                                    className="h-3 w-3"
                                    strokeWidth={2}
                                  />
                                </Button>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Total: {item.totalQuantity} • Fulfilled:{" "}
                              {item.fulfilledQuantity}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <ShippingTabs
                      providers={providersData?.shippingProviders || []}
                      order={order}
                      onRateSelect={setSelectedRate}
                      onProviderToggle={handleProviderToggle}
                      selectedQuantities={selectedQuantities}
                      setSelectedQuantities={setSelectedQuantities}
                      trackingNumber={trackingNumber}
                      setTrackingNumber={setTrackingNumber}
                      carrier={carrier}
                      setCarrier={setCarrier}
                      noNotification={noNotification}
                      setNoNotification={setNoNotification}
                      onManualFulfill={handleFulfill}
                      fulfillmentState={fulfillmentState}
                    />
                  </>
                )}
                {order.fulfillments?.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="uppercase font-medium text-muted-foreground tracking-wide text-xs">
                      Fulfillment History
                    </h3>
                    {order.fulfillments.map((fulfillment) => (
                      <div
                        key={fulfillment.id}
                        className="border rounded-md bg-muted/40 p-4"
                      >
                        <div className="flex justify-between mb-4">
                          <div>
                            <p className="text-sm font-medium">
                              Fulfilled on{" "}
                              {new Date(
                                fulfillment.createdAt
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            {fulfillment.shippingLabels?.[0] && (
                              <ToggleGroup
                                type="single"
                                variant="outline"
                                className="inline-flex gap-0 -space-x-px rounded-md shadow-sm shadow-black/5 bg-background"
                              >
                                <TooltipProvider delayDuration={0}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <ToggleGroupItem
                                        value="label"
                                        className="h-6 px-2 text-xs rounded-none shadow-none first:rounded-s-md focus-visible:z-10"
                                      >
                                        Label
                                      </ToggleGroupItem>
                                    </TooltipTrigger>
                                    <TooltipContent className="py-3">
                                      <div className="space-y-1">
                                        <p className="text-[13px] font-medium">
                                          Tracking Information
                                        </p>
                                        <div className="flex items-center gap-2">
                                          <p className="text-xs text-muted-foreground">
                                            {
                                              fulfillment.shippingLabels[0]
                                                .trackingNumber
                                            }
                                          </p>
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="[&_svg]:size-3 w-5 h-5"
                                            onClick={() => {
                                              navigator.clipboard.writeText(
                                                fulfillment.shippingLabels[0]
                                                  .trackingNumber
                                              );
                                            }}
                                          >
                                            <Copy />
                                          </Button>
                                        </div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                {fulfillment.shippingLabels?.[0]?.labelUrl && (
                                  <ToggleGroupItem
                                    value="download"
                                    className="h-6 px-2 rounded-none shadow-none last:rounded-e-md focus-visible:z-10"
                                    onClick={() =>
                                      window.open(
                                        fulfillment.shippingLabels[0].labelUrl,
                                        "_blank"
                                      )
                                    }
                                  >
                                    <Download className="h-3 w-3" />
                                  </ToggleGroupItem>
                                )}
                              </ToggleGroup>
                            )}
                            <Button
                              variant="outline"
                              size="icon"
                              className="[&_svg]:size-3 w-6 h-6"
                              onClick={() =>
                                handleDeleteFulfillment(
                                  fulfillment.id,
                                  `Fulfillment #${fulfillment.id}`
                                )
                              }
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {fulfillment.fulfillmentItems.map((item) => (
                            <div
                              key={item.lineItem.id}
                              className="flex items-start gap-3 border rounded-lg p-2 bg-background/40 shadow-xs"
                            >
                              <div className="h-12 w-12 bg-muted rounded-md flex-shrink-0">
                                {item.lineItem.thumbnail && (
                                  <Image
                                    src={item.lineItem.thumbnail}
                                    alt={item.lineItem.title}
                                    width={48}
                                    height={48}
                                    className="rounded-md object-cover"
                                  />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  {item.lineItem.title}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Quantity: {item.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between p-3 pb-0">
                <CardTitle className="text-base font-medium">
                  Shipping address
                </CardTitle>
                <EditDialog
                  title="Edit Shipping Address"
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
              </CardHeader>
              <CardContent className="p-3 pt-3">
                <div className="space-y-1 text-sm">
                  <p className="font-medium">
                    {order.shippingAddress.firstName}{" "}
                    {order.shippingAddress.lastName}
                  </p>
                  {order.shippingAddress.company && (
                    <p>{order.shippingAddress.company}</p>
                  )}
                  <p>{order.shippingAddress.address1}</p>
                  {order.shippingAddress.address2 && (
                    <p>{order.shippingAddress.address2}</p>
                  )}
                  <p>
                    {order.shippingAddress.city},{" "}
                    {order.shippingAddress.province}{" "}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country.name}</p>
                  <p>{order.shippingAddress.phone}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
