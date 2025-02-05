"use client";

import {
  useState,
  useContext,
  createContext,
  forwardRef,
  useEffect,
  useId,
} from "react";
import {
  Plus,
  MoreHorizontal,
  MoreVertical,
  PenSquare,
  Trash2,
  X,
  CreditCard,
  Info,
  Check,
  Package,
  ScanBarcode,
  Settings,
  Code2,
  Home,
  KeyRound,
  MapPin,
  Truck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel
} from "@ui/select";
import { CreateDialog } from "../page";
import { ShippingProviderRates } from "./ShippingProviderRates";
import { CardContent } from "@ui/card";
import { DimensionsInput } from "./DimensionsInput";
import { WeightInput } from "./WeightInput";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@keystone/utils/cn";
import { useDrawer } from "@keystone/themes/Tailwind/orion/components/Modals/drawer-context";
import { useList } from "@keystone/keystoneProvider";
import { DeleteButton } from "@keystone/themes/Tailwind/orion/components/EditItemDrawer";
import { Alert, AlertDescription } from "@ui/alert";
import { Skeleton } from "@ui/skeleton";
import { gql, useMutation, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
import { useDeleteItem } from "@keystone/themes/Tailwind/orion/components/EditItemDrawer";
import { GraphQLErrorNotice } from "@keystone/themes/Tailwind/orion/components/GraphQLErrorNotice";
import { getCarrierIconUrl } from "./ShippingProviderRates";
import { Label } from "@ui/label";
import { Input } from "@ui/input";
import { Checkbox } from "@ui/checkbox";
import { useCreateItem } from "@keystone/utils/useCreateItem";
import { Fields } from "@keystone/themes/Tailwind/orion/components/Fields";
import { getFilteredProps } from "@keystone/utils/getFilteredProps";
import { ScrollArea, ScrollBar } from "@ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";
import { Badge } from "@ui/badge";
import { RadioGroup, RadioGroupItem } from "@ui/radio-group";

const CREATE_PROVIDER_SHIPPING_LABEL = gql`
  mutation CreateProviderShippingLabel(
    $orderId: ID!
    $providerId: ID!
    $rateId: String!
    $dimensions: DimensionsInput
    $lineItems: [LineItemInput!]
  ) {
    createProviderShippingLabel(
      orderId: $orderId
      providerId: $providerId
      rateId: $rateId
      dimensions: $dimensions
      lineItems: $lineItems
    ) {
      id
      status
      trackingNumber
      trackingUrl
      labelUrl
      data
    }
  }
`;

const GET_USER_ADDRESSES = gql`
  query GetUserAddresses($userId: ID!) {
    addresses(where: { user: { id: { equals: $userId } } }) {
      id
      company
      firstName
      lastName
      address1
      address2
      city
      province
      postalCode
      phone
      label
    }
  }
`;

const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    authenticatedItem {
      ... on User {
        id
      }
    }
  }
`;

function StatusIndicator({ provider, isPreset }) {
  if (isPreset && !provider?.isActive) {
    return (
      <span className="inline-block w-2.5 h-2.5 rounded-full border-2 bg-zinc-200 border-zinc-300" />
    );
  }

  return (
    <span
      className={cn(
        "inline-block w-2.5 h-2.5 rounded-full border-2",
        provider?.isActive
          ? "bg-green-500 border-green-300"
          : "bg-red-500 border-red-300"
      )}
    />
  );
}

function ProviderActionsInline({ provider, onProviderToggle, children }) {
  const { openEditDrawer } = useDrawer();
  const { handleDelete } = useDeleteItem("ShippingProvider");
  const handleDeleteProvider = async () => {
    const result = await handleDelete(provider.id, provider.name);
    // Additional handling if needed
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => onProviderToggle(provider.id)}
          className="gap-2 font-medium tracking-wide text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          {provider.isActive ? "DEACTIVATE" : "ACTIVATE"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => openEditDrawer(provider.id, "ShippingProvider")}
          className="gap-2 font-medium tracking-wide text-xs"
        >
          <PenSquare className="h-3.5 w-3.5" />
          EDIT PROVIDER
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDeleteProvider}
          className="gap-2 font-medium tracking-wide text-xs text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
          DELETE PROVIDER
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Manual Tab Component
function ManualTabContent({
  trackingNumber,
  setTrackingNumber,
  carrier,
  setCarrier,
  noNotification,
  setNoNotification,
  handleManualFulfill,
  fulfillmentState,
  hasSelectedItems,
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Label className="mb-1.5 block text-xs">Tracking number</Label>
          <Input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="h-8 rounded-lg text-sm"
          />
        </div>
        <div className="w-[140px]">
          <Label className="mb-1.5 block text-xs">Carrier</Label>
          <Select value={carrier} onValueChange={setCarrier}>
            <SelectTrigger className="h-8 rounded-lg text-sm">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ups">UPS</SelectItem>
              <SelectItem value="usps">USPS</SelectItem>
              <SelectItem value="fedex">FedEx</SelectItem>
              <SelectItem value="dhl">DHL</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="send-notification"
            checked={!noNotification}
            onCheckedChange={(checked) => setNoNotification(!checked)}
          />
          <Label htmlFor="send-notification" className="text-sm">
            Notify customer
          </Label>
        </div>

        <Button
          onClick={handleManualFulfill}
          size="sm"
          disabled={fulfillmentState === "loading" || !hasSelectedItems}
          isLoading={fulfillmentState === "loading"}
          className="h-8 rounded-lg"
        >
          {fulfillmentState === "loading" ? "Fulfilling..." : "Fulfill items"}
        </Button>
      </div>
    </div>
  );
}

// Provider Tab Component
function ProviderTabContent({
  provider,
  selectedRate,
  setSelectedRate,
  error,
  loading,
  handleCreateLabel,
  hasSelectedItems,
  order,
  onRateSelect,
  dimensions,
  weight,
}) {
  return (
    <div className="flex flex-col gap-4">
      {selectedRate && (
        <div className="flex flex-col sticky top-4 h-fit">
          <div className="flex justify-between items-start p-2 rounded-lg bg-muted/40 border">
            <div className="flex flex-wrap gap-4 items-center">
              {getCarrierIconUrl(selectedRate.carrier, new Set()) ? (
                <img
                  src={getCarrierIconUrl(selectedRate.carrier, new Set())}
                  alt={selectedRate.carrier}
                  className="h-6 w-auto mt-0.5"
                />
              ) : (
                <div className="h-6 px-2 bg-zinc-100 rounded flex items-center">
                  <span className="text-sm font-medium truncate max-w-[100px]">
                    {selectedRate.carrier}
                  </span>
                </div>
              )}
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {selectedRate.service}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {selectedRate.provider} • {selectedRate.estimatedDays} days
                </span>
                <span className="text-sm font-medium">
                  ${selectedRate.price}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end h-full gap-3.5">
              <div className="flex items-center gap-2">
                {error && (
                  <div className="text-xs">
                    <GraphQLErrorNotice
                      networkError={error?.networkError}
                      errors={error?.graphQLErrors}
                    />
                  </div>
                )}
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => setSelectedRate(null)}
                  className="h-5 w-5 border"
                >
                  <X />
                </Button>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 flex items-center gap-2"
                onClick={handleCreateLabel}
                disabled={loading || !hasSelectedItems}
                isLoading={loading}
              >
                <CreditCard className="size-3" />
                Create Label
                {!hasSelectedItems && (
                  <span className="text-xs text-muted-foreground">
                    (No items selected)
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      <ShippingProviderRates
        provider={provider}
        order={order}
        onRateSelect={onRateSelect}
        dimensions={dimensions}
        weight={weight}
      />
    </div>
  );
}

// Update the AddressSelect component to use real data
function AddressSelect({ value, onChange }) {
  const id = useId();
  const [showNewAddress, setShowNewAddress] = useState(false);
  const { data: userData } = useQuery(GET_CURRENT_USER);
  const userId = userData?.authenticatedItem?.id;
  
  const { data: addressData, loading } = useQuery(GET_USER_ADDRESSES, {
    variables: { userId },
    skip: !userId,
  });

  const addresses = addressData?.addresses || [];

  return (
    <div className="space-y-4">
      <RadioGroup 
        className="gap-2" 
        value={value} 
        onValueChange={(val) => {
          if (val === 'new') {
            setShowNewAddress(true);
          } else {
            setShowNewAddress(false);
            onChange(val);
          }
        }}
      >
        {loading ? (
          <div className="p-4 text-sm text-muted-foreground">Loading addresses...</div>
        ) : addresses.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">No addresses found</div>
        ) : (
          addresses.map((address) => (
            <div key={address.id} className="relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring">
              <RadioGroupItem
                value={address.id}
                id={`${id}-${address.id}`}
                aria-describedby={`${id}-${address.id}-description`}
                className="order-1 after:absolute after:inset-0"
              />
              <div className="grid grow gap-2">
                <Label htmlFor={`${id}-${address.id}`}>
                  {address.company || `${address.firstName} ${address.lastName}`}{" "}
                  {address.phone && (
                    <span className="text-xs font-normal leading-[inherit] text-muted-foreground">
                      ({address.phone})
                    </span>
                  )}
                </Label>
                <p id={`${id}-${address.id}-description`} className="text-xs text-muted-foreground">
                  {[
                    address.address1,
                    address.address2,
                    [address.city, address.province, address.postalCode].filter(Boolean).join(', ')
                  ].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
          ))
        )}
        
        <div className="relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring">
          <RadioGroupItem
            value="new"
            id={`${id}-new`}
            className="order-1 after:absolute after:inset-0"
          />
          <div className="grid grow gap-2">
            <Label htmlFor={`${id}-new`}>
              Create New Address
            </Label>
          </div>
        </div>
      </RadioGroup>

      {showNewAddress && (
        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <Label className="mb-1.5 block text-xs">First Name</Label>
              <Input className="h-8 rounded-lg text-sm" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label className="mb-1.5 block text-xs">Last Name</Label>
              <Input className="h-8 rounded-lg text-sm" />
            </div>
          </div>
          
          <div>
            <Label className="mb-1.5 block text-xs">Company (Optional)</Label>
            <Input className="h-8 rounded-lg text-sm" />
          </div>
          
          <div>
            <Label className="mb-1.5 block text-xs">Street Address</Label>
            <Input className="h-8 rounded-lg text-sm mb-2" placeholder="Address Line 1" />
            <Input className="h-8 rounded-lg text-sm" placeholder="Address Line 2 (Optional)" />
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <Label className="mb-1.5 block text-xs">City</Label>
              <Input className="h-8 rounded-lg text-sm" />
            </div>
            <div className="w-[100px]">
              <Label className="mb-1.5 block text-xs">State</Label>
              <Input className="h-8 rounded-lg text-sm" />
            </div>
            <div className="w-[120px]">
              <Label className="mb-1.5 block text-xs">ZIP Code</Label>
              <Input className="h-8 rounded-lg text-sm" />
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs">Phone Number</Label>
            <Input className="h-8 rounded-lg text-sm" />
          </div>

          <Button 
            size="sm" 
            className="h-8 rounded-lg"
            onClick={() => {
              // Handle save new address
              setShowNewAddress(false);
            }}
          >
            Save Address
          </Button>
        </div>
      )}
    </div>
  );
}

// PresetTab Tab Component
function PresetTabContent({ provider, providerProps }) {
  return (
    <Fields
      {...getFilteredProps(providerProps, [
        { key: "name", fieldMeta: { defaultValue: provider.name } },
        { key: "accessToken" },
      ])}
    >
      <AddressSelect 
        value={provider.fromAddress} 
        onChange={(address) => {
          // Handle address change
        }}
        addresses={[
          {
            id: '1',
            name: 'Main Office',
            type: 'Business',
            street: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            zip: '94105'
          },
          // Add more addresses as needed
        ]}
      />
    </Fields>
  );
}

// New Provider Tab Component
function NewProviderTabContent({ providerProps }) {
  const [activeTab, setActiveTab] = useState("general");

  const fieldGroups = {
    general: {
      icon: Settings,
      label: "General",
      fields: [
        { key: "name" },
      ],
    },
    authentication: {
      icon: KeyRound,
      label: "Authentication",
      fields: [
        { key: "accessToken" },
      ],
    },
    address: {
      icon: MapPin,
      label: "Address",
      fields: [
        { key: "fromAddress" },
      ],
    },
    functions: {
      icon: Code2,
      label: "Functions",
      fields: [
        { key: "createLabelFunction" },
        { key: "getRatesFunction" },
        { key: "validateAddressFunction" },
        { key: "trackShipmentFunction" },
        { key: "cancelLabelFunction" },
      ],
    },
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="flex w-full gap-2">
      <TabsList className="flex-col rounded-none border-l border-border bg-transparent p-0 h-auto mb-auto">
        {Object.entries(fieldGroups).map(([key, group]) => (
          <TabsTrigger
            key={key}
            value={key}
            className="relative w-full justify-start rounded-none text-xs after:absolute after:inset-y-0 after:start-0 after:w-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
          >
            <div className="flex items-center gap-2">
              <group.icon
                className="opacity-60"
                size={14}
                strokeWidth={2}
                aria-hidden="true"
              />
              {group.label}
            </div>
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="grow rounded-lg border border-border text-start">
        {Object.entries(fieldGroups).map(([key, group]) => (
          <TabsContent key={key} value={key} className="px-4 py-3">
            <Fields
              {...getFilteredProps(providerProps, group.fields)}
            />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}

export function ShippingTabs({
  providers = [],
  order,
  onRateSelect,
  onProviderToggle,
  selectedQuantities,
  setSelectedQuantities,
}) {
  const [dimensions, setDimensions] = useState({
    unit: "in",
    length: "5",
    width: "5",
    height: "5",
  });
  const [weight, setWeight] = useState({ unit: "oz", value: "5" });
  const [selectedTab, setSelectedTab] = useState("manual");
  const [selectedRate, setSelectedRate] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [noNotification, setNoNotification] = useState(false);

  const fulfillmentList = useList("Fulfillment");
  const { createWithData: createFulfillment, state: fulfillmentState } =
    useCreateItem(fulfillmentList);
  const shippingProviderList = useList("ShippingProvider");
  const {
    create,
    props: createProps,
    state,
    error: shippingProviderError,
  } = useCreateItem(shippingProviderList);

  const [createLabel, { loading, error }] = useMutation(
    CREATE_PROVIDER_SHIPPING_LABEL,
    {
      refetchQueries: ["GetOrder"],
    }
  );

  const hasSelectedItems = Object.values(selectedQuantities).some(
    (qty) => parseInt(qty) > 0
  );

  const handleCreateLabel = async () => {
    if (!selectedRate || !hasSelectedItems) return;

    try {
      const result = await createLabel({
        variables: {
          orderId: order.id,
          providerId: selectedRate.providerId,
          rateId: selectedRate.id,
          dimensions: {
            length: parseFloat(dimensions.length),
            width: parseFloat(dimensions.width),
            height: parseFloat(dimensions.height),
            weight: parseFloat(weight.value),
            unit: dimensions.unit,
            weightUnit: weight.unit,
          },
          lineItems: Object.entries(selectedQuantities)
            .filter(([_, qty]) => parseInt(qty) > 0)
            .map(([id, qty]) => ({
              lineItemId: id,
              quantity: parseInt(qty),
            })),
        },
      });
    } catch (error) {
      console.log({ error });
    }
  };

  const handleManualFulfill = async () => {
    try {
      const itemsToFulfill = Object.entries(selectedQuantities)
        .filter(([_, quantity]) => parseInt(quantity) > 0)
        .map(([lineItemId, quantity]) => {
          const lineItem = order.unfulfilled.find(
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
        order: { connect: { id: order.id } },
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
          items: itemsToFulfill,
        },
      };

      const result = await createFulfillment({ data: fulfillmentData });
      if (!result) throw new Error("Failed to create fulfillment");

      // Reset form
      setSelectedQuantities({});
      setTrackingNumber("");
      setCarrier("");
      setNoNotification(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRateSelect = (rate) => {
    setSelectedRate(rate);
    onRateSelect?.(rate);
  };

  // Compute dynamic provider tabs combining configured providers and presets
  const computedProviders = [
    ...providers,
    ...[
      { id: "shippo", name: "Shippo", isPreset: true },
      { id: "shipengine", name: "ShipEngine", isPreset: true },
    ].filter(
      (p) => !providers.find((existing) => existing.name.toLowerCase() === p.id)
    ),
  ];

  // JSON map for tab configuration
  const tabsConfig = [
    {
      id: "manual",
      label: "Manual",
      icon: Package,
      Component: () => (
        <ManualTabContent
          trackingNumber={trackingNumber}
          setTrackingNumber={setTrackingNumber}
          carrier={carrier}
          setCarrier={setCarrier}
          noNotification={noNotification}
          setNoNotification={setNoNotification}
          handleManualFulfill={handleManualFulfill}
          fulfillmentState={fulfillmentState}
          hasSelectedItems={hasSelectedItems}
        />
      ),
    },
    ...computedProviders.map((provider) => {
      const ContentComponent = provider.isPreset
        ? () => (<PresetTabContent provider={provider} providerProps={createProps} />)
        : () => (
          <ProviderTabContent
            provider={provider}
            selectedRate={selectedRate}
            setSelectedRate={setSelectedRate}
            error={error}
            loading={loading}
            handleCreateLabel={handleCreateLabel}
            hasSelectedItems={hasSelectedItems}
            order={order}
            onRateSelect={handleRateSelect}
            dimensions={dimensions}
            weight={weight}
          />
        );
      return {
        id: provider.id,
        label: provider.name,
        icon: provider.icon,
        isPreset: provider.isPreset,
        Component: ContentComponent,
      };
    }),
    {
      id: "new",
      label: "New Provider",
      icon: Plus,
      Component: () => <NewProviderTabContent providerProps={createProps} />,
    },
  ];

  return (
    <div className="rounded-lg border">
      <CardContent className="p-4">
        {/* Package Information Section */}
        <div className="mb-8">
          <div>
            <h3 className="font-medium uppercase text-xs tracking-wider text-muted-foreground mb-2">
              Package Dimensions
            </h3>
            <div className="flex flex-wrap gap-4">
              <DimensionsInput
                dimensions={dimensions}
                setDimensions={setDimensions}
              />
              <WeightInput weight={weight} setWeight={setWeight} />
            </div>
          </div>
        </div>

        {/* Shipping Method Selection */}
        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-medium uppercase text-xs tracking-wider text-muted-foreground mb-2">
              Shipping Method
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Select value={selectedTab} onValueChange={setSelectedTab}>
                <SelectTrigger
                  className="shadow-sm w-auto gap-6 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0 text-xs font-medium opacity-90 h-8 rounded-lg"
                >
                  <SelectValue placeholder="Select shipping method" />
                </SelectTrigger>
                <SelectContent className="[&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span>svg]:text-muted-foreground/80 [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2">
                  <SelectGroup>
                    <SelectLabel className="text-muted-foreground font-normal text-xs ps-2">
                      Select shipping method
                    </SelectLabel>
                    {tabsConfig.map((tab) => {
                      const actualProvider = providers.find(p => p.id === tab.id) || tab;
                      return (
                        <SelectItem
                          key={tab.id}
                          value={tab.id}
                          className="text-xs font-medium"
                        >
                          <span className="flex items-center gap-2">
                            {tab.icon ? (
                              <tab.icon
                                className="opacity-60"
                                size={10}
                                strokeWidth={2}
                                aria-hidden="true"
                              />
                            ) : (
                              <StatusIndicator 
                                provider={actualProvider} 
                                isPreset={tab.isPreset} 
                              />
                            )}
                            <span className="truncate uppercase tracking-wide opacity-75 font-medium">{tab.label}</span>
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {selectedTab !== "manual" && selectedTab !== "new" && (
                <ProviderActionsInline 
                  provider={providers.find(p => p.id === selectedTab) || tabsConfig.find(t => t.id === selectedTab)} 
                  onProviderToggle={onProviderToggle}
                >
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </ProviderActionsInline>
              )}
            </div>

            {tabsConfig.find(tab => tab.id === selectedTab)?.Component()}
          </div>
        </div>
      </CardContent>
    </div>
  );
}
