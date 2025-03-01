"use client";

import { useState, useMemo, useId } from "react";
import {
  ArrowLeft,
  Info,
  Package,
  ChevronDown,
  ChevronUp,
  ScanBarcode,
  Plus,
  Minus,
  Ban,
  PackageCheck,
  CircleSlash,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  gql,
  useQuery,
  useApolloClient,
  useMutation,
} from "@keystone-6/core/admin-ui/apollo";
import { useList } from "@keystone/keystoneProvider";
import { useCreateItem } from "@keystone/utils/useCreateItem";
import { useRouter } from "next/navigation";

import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Label } from "@ui/label";
import { Separator } from "@ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
import { useDeleteItem } from "@keystone/themes/Tailwind/orion/components/EditItemDrawer";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from "@ui/select";
import { Fields } from "@keystone/themes/Tailwind/orion/components/Fields";

import { useUpdateItem } from "@keystone/themes/Tailwind/orion/components/EditItemDrawer";
import { ShippingTabs } from "./components/ShippingTabs";
import { PageBreadcrumbs } from "@keystone/themes/Tailwind/orion/components/PageBreadcrumbs";
import { GraphQLErrorNotice } from "@keystone/themes/Tailwind/orion/components/GraphQLErrorNotice";
import { getCarrierIconUrl } from "./components/ShippingTabs/ShippingProviderRates";
import { AdminLink } from "@keystone/themes/Tailwind/orion/components/AdminLink";

const UNFULFILLED_ITEMS_QUERY = gql`
  query UNFULFILLED_ITEMS_QUERY($orderId: ID!) {
    order(where: { id: $orderId }) {
      id
      displayId
      createdAt
      unfulfilled
      fulfillmentDetails
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
        fulfillmentItems {
          id
          quantity
          fulfillment {
            id
            canceledAt
          }
        }
      }
    }
  }
`;

const FULFILLMENT_HISTORY_QUERY = gql`
  query FULFILLMENT_HISTORY_QUERY($orderId: ID!) {
    order(where: { id: $orderId }) {
      id
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

const UPDATE_FULFILLMENTS = gql`
  mutation UpdateFulfillments($data: [FulfillmentUpdateArgs!]!) {
    updateFulfillments(data: $data) {
      id
      canceledAt
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
      <DialogTrigger>{children}</DialogTrigger>
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
  const router = useRouter();
  const fulfillmentList = useList("Fulfillment");

  const { createWithData: createFulfillment, state: fulfillmentState } =
    useCreateItem(fulfillmentList);
  const { handleDelete } = useDeleteItem("Fulfillment");
  const {
    handleUpdate: handleFulfillmentCancel,
    state: fulfillmentCancelLoading,
    error: fulfillmentCancelError,
  } = useUpdateItem("Fulfillment");
  const {
    handleUpdate: handleProviderUpdate,
    state: providerUpdateLoading,
    error: providerUpdateError,
  } = useUpdateItem("ShippingProvider");

  const {
    data: providersData,
    loading: providersLoading,
    refetch: refetchProviders,
  } = useQuery(GET_SHIPPING_PROVIDERS);

  const { data, loading, error } = useQuery(UNFULFILLED_ITEMS_QUERY, {
    variables: { orderId: params.id },
    onCompleted: (data) => {
      const initialQuantities = {};
      data.order.unfulfilled.forEach((item) => {
        initialQuantities[item.id] = item.quantity;
      });
      setSelectedQuantities(initialQuantities);
    },
  });

  const handleRateSelect = (rate) => {
    setSelectedRate(rate);
  };

  const handleProviderToggle = async (providerId) => {
    try {
      const provider = providersData.shippingProviders.find(
        (p) => p.id === providerId
      );
      if (!provider) return;

      await handleProviderUpdate(providerId, {
        isActive: !provider.isActive,
      });

      // Refetch queries to update UI
      await client.refetchQueries({
        include: "active",
      });
    } catch (error) {
      console.error("Failed to toggle provider status:", error);
    }
  };

  const handleDeleteFulfillment = async (id) => {
    try {
      await handleFulfillmentCancel(id, {
        canceledAt: new Date().toISOString(),
      });

      await client.refetchQueries({
        include: ["GetOrder"],
      });
    } catch (error) {
      console.error("Failed to cancel fulfillment:", error);
    }
  };

  if (loading) return null;
  if (error?.graphQLErrors.length || error?.networkError) {
    return (
      <GraphQLErrorNotice
        errors={error?.graphQLErrors}
        networkError={error?.networkError}
      />
    );
  }
  if (!data?.order) {
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
          const lineItem = unfulfilledItems.find(
            (item) => item.id === lineItemId
          );
          if (!lineItem) {
            throw new Error(`Line item ${lineItemId} not found`);
          }

          const requestedQuantity = parseInt(quantity);
          if (requestedQuantity > lineItem.quantity) {
            throw new Error(
              `Cannot fulfill more than ${lineItem.quantity} items for ${lineItem.title}`
            );
          }

          return {
            lineItemId,
            quantity: requestedQuantity,
            title: lineItem.title,
          };
        });

      if (itemsToFulfill.length === 0) {
        throw new Error("No items selected for fulfillment");
      }

      const fulfillmentData = {
        order: { connect: { id: params.id } },
        fulfillmentItems: {
          create: itemsToFulfill.map(({ lineItemId, quantity }) => ({
            lineItem: { connect: { id: lineItemId } },
            quantity,
          })),
        },
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

      const result = await createFulfillment({ data: fulfillmentData });

      if (!result) {
        throw new Error("Failed to create fulfillment");
      }

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
      console.error("Failed to create fulfillment:", error);
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
      <div className="min-h-screen bg-muted/5">
        <div className="max-w-7xl p-4 md:p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Button variant="link" className="px-0">
                <AdminLink
                  href={`/platform/orders/${order.id}`}
                  className="flex items-center text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Order
                </AdminLink>
              </Button>
            </div>
            <h1 className="text-2xl font-semibold">Fulfill Order</h1>
            <p className="text-sm text-muted-foreground">
              Order #{data.order.displayId} •{" "}
              {new Date(data.order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
              <UnfulfilledItems
                items={unfulfilledItems}
                selectedQuantities={selectedQuantities}
                setSelectedQuantities={setSelectedQuantities}
                order={order}
              />

              {order.fulfillmentDetails?.length > 0 && (
                <FulfillmentHistory
                  fulfillments={order.fulfillmentDetails}
                  onDelete={handleDeleteFulfillment}
                />
              )}
            </div>

            {unfulfilledItems.length > 0 && (
              <div className="lg:col-span-5 space-y-6">
                <div className="lg:sticky lg:top-6">
                  <ShippingTabs
                    providers={providersData?.shippingProviders || []}
                    order={data?.order}
                    onRateSelect={handleRateSelect}
                    onProviderToggle={handleProviderToggle}
                    selectedQuantities={selectedQuantities}
                    setSelectedQuantities={setSelectedQuantities}
                    refetchProviders={refetchProviders}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// New component for unfulfilled items section
function UnfulfilledItems({
  items,
  selectedQuantities,
  setSelectedQuantities,
  order,
}) {
  const client = useApolloClient();
  const [updateFulfillments, { loading: updateFulfillmentsLoading }] =
    useMutation(UPDATE_FULFILLMENTS);

  const handleCancelAll = async () => {
    try {
      const activeFulfillments = order.fulfillmentDetails.filter(
        (f) => !f.canceledAt
      );
      if (!activeFulfillments.length) return;

      await updateFulfillments({
        variables: {
          data: activeFulfillments.map((f) => ({
            where: { id: f.id },
            data: { canceledAt: new Date().toISOString() },
          })),
        },
      });

      await client.refetchQueries({
        include: ["GetOrder"],
      });
    } catch (error) {
      console.error("Failed to cancel fulfillments:", error);
    }
  };

  return (
    <Card>
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between border-b">
        <h3 className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
          Unfulfilled Items
        </h3>
      </CardHeader>
      <CardContent className="px-4 py-1 divide-y">
        {items.length > 0 ? (
          items.map((item) => (
            <UnfulfilledItem
              key={item.id}
              item={item}
              selected={selectedQuantities[item.id] > 0}
              quantity={selectedQuantities[item.id] || 0}
              onSelectionChange={(checked) =>
                setSelectedQuantities((prev) => ({
                  ...prev,
                  [item.id]: checked ? item.quantity : 0,
                }))
              }
              onQuantityChange={(quantity) =>
                setSelectedQuantities((prev) => ({
                  ...prev,
                  [item.id]: parseInt(quantity),
                }))
              }
            />
          ))
        ) : (
          <div className="flex h-44 items-center justify-center rounded-lg border bg-muted/40 p-4 my-3">
            <div className="text-center">
              <PackageCheck
                className="mx-auto h-7 w-7 text-muted-foreground/50"
                aria-hidden={true}
              />
              <p className="mt-2 text-sm font-medium">
                All items have been fulfilled
              </p>
              <p className="text-sm text-muted-foreground">
                Check fulfillments below for details
              </p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="[&_svg]:size-3 h-7 mt-2"
                  >
                    <CircleSlash />
                    Start Over
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-3" side="bottom">
                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <p className="text-[13px] font-medium">
                        Cancel all fulfillments?
                      </p>
                      <p className="text-xs text-muted-foreground">
                        This will cancel all active fulfillments.
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-7"
                        onClick={handleCancelAll}
                        isLoading={updateFulfillmentsLoading}
                        disabled={updateFulfillmentsLoading}
                      >
                        Cancel All
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Update FulfillmentHistory component
function FulfillmentHistory({ fulfillments, onDelete }) {
  const [expandedFulfillments, setExpandedFulfillments] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    active: true,
    cancelled: false,
  });

  const toggleFulfillment = (id) => {
    setExpandedFulfillments((prev) =>
      prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]
    );
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const activeFulfillments = fulfillments.filter((f) => !f.canceledAt);
  const cancelledFulfillments = fulfillments.filter((f) => f.canceledAt);

  const renderFulfillmentItems = (items) => {
    return items.map((item) => (
      <div
        key={item.id}
        className="flex items-start space-x-4 py-4 border-t first:border-t-0"
      >
        <div className="h-20 w-20 bg-muted/10 rounded-md flex-shrink-0 flex items-center justify-center">
          {item.lineItem.thumbnail ? (
            <Image
              src={item.lineItem.thumbnail}
              alt={item.lineItem.title}
              width={80}
              height={80}
              className="object-cover rounded-md"
            />
          ) : (
            <Package className="h-8 w-8 text-muted-foreground/50" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <h4 className="font-medium text-sm">{item.lineItem.title}</h4>
              {item.lineItem.variantTitle && (
                <p className="text-sm text-muted-foreground">
                  {item.lineItem.variantTitle}
                </p>
              )}
              <div className="flex items-center gap-2">
                {item.lineItem.sku && (
                  <p className="text-xs text-muted-foreground">
                    SKU: {item.lineItem.sku}
                  </p>
                )}
                <Badge className="py-0 text-[11px] border uppercase font-medium tracking-wide rounded-full">
                  {item.quantity} Fulfilled
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium mt-0.5">
                {item.quantity} × {item.lineItem.formattedUnitPrice}
              </div>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      {activeFulfillments.length > 0 && (
        <div className="space-y-4">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("active")}
          >
            <h3 className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
              Active Fulfillments
            </h3>
            <Badge
              className="border py-0.5 px-2 text-[11px] uppercase font-medium tracking-wide rounded-full flex items-center gap-1"
            >
              {activeFulfillments.length}
              {expandedSections.active ? (
                <ChevronUp className="h-3 w-3 ml-0.5" />
              ) : (
                <ChevronDown className="h-3 w-3 ml-0.5" />
              )}
            </Badge>
          </div>
          {expandedSections.active &&
            activeFulfillments.map((fulfillment) => (
              <Card key={fulfillment.id}>
                <CardHeader className="p-4 pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-sm font-medium">
                        Fulfillment #{fulfillment.id.slice(-6)}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {new Date(fulfillment.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="[&_svg]:size-3 h-5 w-5"
                          >
                            <Ban className="h-3.5 w-3.5" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[250px] p-3" side="left">
                          <div className="space-y-2.5">
                            <div className="space-y-1">
                              <p className="text-[13px] font-medium">
                                Cancel fulfillment?
                              </p>
                              <p className="text-xs text-muted-foreground">
                                This action cannot be undone.
                              </p>
                            </div>
                            <div className="flex justify-end">
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-7"
                                onClick={() => onDelete(fulfillment.id)}
                              >
                                Cancel fulfillment
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Button
                        variant="outline"
                        size="icon"
                        className="[&_svg]:size-3 h-5 w-5"
                        onClick={() => toggleFulfillment(fulfillment.id)}
                      >
                        {expandedFulfillments.includes(fulfillment.id) ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {fulfillment.shippingLabels?.[0] && (
                    <div className="flex items-center gap-3 mt-3 pt-3">
                      {fulfillment.shippingLabels[0].carrier && (
                        <div className="flex items-center gap-1.5">
                          <Image
                            src={getCarrierIconUrl(
                              fulfillment.shippingLabels[0].carrier,
                              new Set()
                            )}
                            alt={fulfillment.shippingLabels[0].carrier}
                            width={20}
                            height={20}
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Link
                          href={
                            fulfillment.shippingLabels[0].trackingUrl || "#"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:text-blue-700 hover:underline"
                        >
                          {fulfillment.shippingLabels[0].trackingNumber}
                        </Link>
                        {fulfillment.shippingLabels[0].labelUrl && (
                          <Link
                            href={fulfillment.shippingLabels[0].labelUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 hover:text-blue-700" 
                          >
                            <ScanBarcode className="h-3 w-3" />
                          </Link>   
                        )}
                      </div>
                    </div>
                  )}
                </CardHeader>
                {expandedFulfillments.includes(fulfillment.id) && (
                  <CardContent className="p-4 pt-0">
                    {renderFulfillmentItems(fulfillment.items)}
                  </CardContent>
                )}
              </Card>
            ))}
        </div>
      )}

      {cancelledFulfillments.length > 0 && (
        <div className="space-y-4">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("cancelled")}
          >
            <h3 className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
              Cancelled Fulfillments
            </h3>
            <Badge
              className="border py-0.5 px-2 text-[11px] uppercase font-medium tracking-wide rounded-full flex items-center gap-1"
              color="rose"
            >
              {cancelledFulfillments.length}
              {expandedSections.cancelled ? (
                <ChevronUp className="h-3 w-3 ml-0.5" />
              ) : (
                <ChevronDown className="h-3 w-3 ml-0.5" />
              )}
            </Badge>
          </div>
          {expandedSections.cancelled &&
            cancelledFulfillments.map((fulfillment) => (
              <Card
                key={fulfillment.id}
                className="opacity-75 hover:opacity-100 transition-opacity"
              >
                <CardHeader className="p-4 pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-sm font-medium">
                        Fulfillment #{fulfillment.id.slice(-6)}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {new Date(fulfillment.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="[&_svg]:size-3 h-5 w-5"
                      onClick={() => toggleFulfillment(fulfillment.id)}
                    >
                      {expandedFulfillments.includes(fulfillment.id) ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                  {fulfillment.shippingLabels?.[0] && (
                    <div className="flex items-center gap-3 mt-3 pt-3">
                      {fulfillment.shippingLabels[0].carrier && (
                        <div className="flex items-center gap-1.5">
                          <Image
                            src={getCarrierIconUrl(
                              fulfillment.shippingLabels[0].carrier,
                              new Set()
                            )}
                            alt={fulfillment.shippingLabels[0].carrier}
                            width={20}
                            height={20}
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Link
                          href={
                            fulfillment.shippingLabels[0].trackingUrl || "#"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:text-blue-700 hover:underline"
                        >
                          {fulfillment.shippingLabels[0].trackingNumber}
                        </Link>
                        {fulfillment.shippingLabels[0].labelUrl && (
                          <Link
                            href={fulfillment.shippingLabels[0].labelUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 hover:text-blue-700"
                          >
                            <ScanBarcode className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </CardHeader>
                {expandedFulfillments.includes(fulfillment.id) && (
                  <CardContent className="p-4 pt-0">
                    {renderFulfillmentItems(fulfillment.items)}
                  </CardContent>
                )}
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}

// New component for individual unfulfilled item
function UnfulfilledItem({ item, quantity, onQuantityChange }) {
  const decreaseQuantity = () => {
    if (quantity > 0) {
      onQuantityChange(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < item.quantity) {
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <div className="flex items-start space-x-4 py-2">
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
            <div className="flex items-start justify-between gap-10">
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-sm">{item.title}</span>
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
                  <Badge
                    className="py-0 text-[11px] border uppercase font-medium tracking-wide rounded-full"
                    color="rose"
                  >
                    Unfulfilled
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col items-end gap-4">
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {item.quantity} × {item.formattedUnitPrice}
                  </div>
                  <div className="text-sm font-medium whitespace-nowrap">
                    {item.formattedTotal}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={decreaseQuantity}
                    disabled={quantity === 0}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <div className="flex items-center gap-1 text-xs font-medium tabular-nums">
                    <span aria-label={`Current quantity is ${quantity}`}>
                      {quantity}
                    </span>
                    <span className="text-muted-foreground">
                      of {item.quantity}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={increaseQuantity}
                    disabled={quantity === item.quantity}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
