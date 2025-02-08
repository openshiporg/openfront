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
  ChevronLeft,
  Container,
  Weight,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

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
  SelectLabel,
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
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
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
import { useForm } from "react-hook-form";
import { Separator } from "@ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@ui/tooltip";

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
  query GetUserAddresses($userId: ID!, $take: Int!, $skip: Int!) {
    addresses(
      where: { user: { id: { equals: $userId } } }
      take: $take
      skip: $skip
    ) {
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
    addressesCount(where: { user: { id: { equals: $userId } } })
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

const GET_COUNTRIES = gql`
  query RelationshipSelect(
    $where: CountryWhereInput!
    $take: Int!
    $skip: Int!
  ) {
    items: countries(where: $where, take: $take, skip: $skip) {
      ____id____: id
      ____label____: name
      __typename
    }
    count: countriesCount(where: $where)
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

function ProviderActionsInline({
  provider,
  onProviderToggle,
  children,
  onDelete,
}) {
  const { openEditDrawer } = useDrawer();
  const { handleDelete } = useDeleteItem("ShippingProvider");
  const handleDeleteProvider = async () => {
    const result = await handleDelete(provider.id, provider.name);
    if (result?.success) {
      // If the provider was deleted successfully, call onDelete callback
      onDelete?.(provider);
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => onProviderToggle(provider.id)}
          className="gap-2 font-medium tracking-wide text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          {provider?.isActive ? "DEACTIVATE" : "ACTIVATE"}
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
  dimensions,
  setDimensions,
  weight,
  setWeight,
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <div className="w-[140px]">
          <h3 className="font-medium uppercase text-xs tracking-wider text-muted-foreground mb-1.5">
            Carrier
          </h3>
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
        <div className="flex-1 min-w-[200px]">
          <h3 className="font-medium uppercase text-xs tracking-wider text-muted-foreground mb-1.5">
            Tracking Number
          </h3>
          <Input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="h-8 rounded-lg text-sm"
            placeholder="Enter tracking number"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1.5">
        
          <div className="flex items-center space-x-2">
            <Checkbox
              id="send-notification"
              checked={!noNotification}
              onCheckedChange={(checked) => setNoNotification(!checked)}
            />
            <Label htmlFor="send-notification" asChild>
              <h3 className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
                Notify Customer
              </h3>
            </Label>
          </div>
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
  createLabelError,
  createLabelLoading,
  handleCreateLabel,
  hasSelectedItems,
  order,
  onRateSelect,
  dimensions,
  weight,
}) {
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);

  const handleCreateLabelClick = async () => {
    setIsCreatingLabel(true);
    try {
      await handleCreateLabel();
      // Only clear the selection if successful
      setSelectedRate(null);
    } catch (error) {
      // Error will be handled by parent component
      console.error("Failed to create label:", error);
    } finally {
      setIsCreatingLabel(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {selectedRate && (
        <div className="flex flex-col sticky top-4 h-fit">
          <div className="flex justify-between items-start p-2 rounded-lg bg-muted/40 border">
            <div className="flex flex-wrap gap-4 items-center">
              {getCarrierIconUrl(selectedRate.carrier, new Set()) ? (
                <Image
                  src={getCarrierIconUrl(selectedRate.carrier, new Set())}
                  alt={selectedRate.carrier}
                  className="h-6 w-auto mt-0.5"
                  width={24}
                  height={24}
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
                {createLabelError && (
                  <div className="text-xs">
                    {createLabelError?.networkError && (
                      <Alert variant="destructive">
                        {createLabelError?.networkError?.message}
                      </Alert>
                    )}
                    {createLabelError?.graphQLErrors?.length && (
                      <div className="space-y-2">
                        {createLabelError?.graphQLErrors?.map((err, idx) => (
                          <Alert key={idx} variant="destructive">
                            <AlertTitle>System Error</AlertTitle>
                            <AlertDescription>
                              {err?.extensions?.originalError.message ||
                                err.message}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    )}
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
                onClick={handleCreateLabelClick}
                disabled={isCreatingLabel || !hasSelectedItems}
                isLoading={isCreatingLabel}
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

// Update AddressSelect component to handle creation
function AddressSelect({ value, onChange }) {
  const id = useId();
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const addressesPerPage = 5;

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      company: "",
      address1: "",
      address2: "",
      city: "",
      province: "",
      postalCode: "",
      phone: "",
      country: "",
    },
  });

  const { data: userData } = useQuery(GET_CURRENT_USER);
  const userId = userData?.authenticatedItem?.id;

  const {
    data: addressData,
    loading: addressesLoading,
    refetch,
  } = useQuery(GET_USER_ADDRESSES, {
    variables: {
      userId,
      take: addressesPerPage,
      skip: (currentPage - 1) * addressesPerPage,
    },
    skip: !userId,
  });

  const { data: countriesData, loading: countriesLoading } = useQuery(
    GET_COUNTRIES,
    {
      variables: {
        where: {},
        take: 250,
        skip: 0,
      },
    }
  );

  const addressList = useList("Address");
  const { createWithData: createAddress, state: createState } =
    useCreateItem(addressList);

  const addresses = addressData?.addresses || [];
  const totalAddresses = addressData?.addressesCount || 0;
  const totalPages = Math.ceil(totalAddresses / addressesPerPage);

  const countries = countriesData?.items || [];

  const onSubmit = async (data) => {
    try {
      const result = await createAddress({
        data: {
          ...data,
          user: { connect: { id: userId } },
          country: { connect: { id: data.country } },
        },
      });

      if (result?.id) {
        setShowNewAddress(false);
        onChange(result.id);
        refetch();
        form.reset();
      }
    } catch (error) {
      console.error("Failed to create address:", error);
    }
  };

  return (
    <div className="space-y-2 mt-2">
      <Label className="mb-1.5 text-xs">Shipping from Address</Label>

      {showNewAddress ? (
        <div className="space-y-4 rounded-lg border p-4 bg-muted/40">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setShowNewAddress(false);
                form.reset();
              }}
              className="[&_svg]:size-3 w-5 h-5"
            >
              <ChevronLeft />
            </Button>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <Label className="mb-1.5 block text-xs">First Name</Label>
                <Input
                  className="h-8 rounded-lg text-sm"
                  placeholder="John"
                  {...form.register("firstName", { required: true })}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label className="mb-1.5 block text-xs">Last Name</Label>
                <Input
                  className="h-8 rounded-lg text-sm"
                  placeholder="Doe"
                  {...form.register("lastName", { required: true })}
                />
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block text-xs">Company (Optional)</Label>
              <Input
                className="h-8 rounded-lg text-sm"
                placeholder="Acme Inc."
                {...form.register("company")}
              />
            </div>

            <div>
              <Label className="mb-1.5 block text-xs">Street Address</Label>
              <Input
                className="h-8 rounded-lg text-sm mb-2"
                placeholder="123 Main Street"
                {...form.register("address1", { required: true })}
              />
              <Input
                className="h-8 rounded-lg text-sm"
                placeholder="Suite 100 (Optional)"
                {...form.register("address2")}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <Label className="mb-1.5 block text-xs">City</Label>
                <Input
                  className="h-8 rounded-lg text-sm"
                  placeholder="San Francisco"
                  {...form.register("city", { required: true })}
                />
              </div>
              <div className="w-[100px]">
                <Label className="mb-1.5 block text-xs">State</Label>
                <Input
                  className="h-8 rounded-lg text-sm"
                  placeholder="CA"
                  {...form.register("province", { required: true })}
                />
              </div>
              <div className="w-[120px]">
                <Label className="mb-1.5 block text-xs">ZIP Code</Label>
                <Input
                  className="h-8 rounded-lg text-sm"
                  placeholder="94105"
                  {...form.register("postalCode", { required: true })}
                />
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block text-xs">Country</Label>
              <Select
                onValueChange={(value) => form.setValue("country", value)}
                value={form.watch("country")}
              >
                <SelectTrigger className="h-8 rounded-lg text-sm">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {countriesLoading ? (
                      <SelectItem value="" disabled>
                        Loading...
                      </SelectItem>
                    ) : (
                      countries.map((country) => (
                        <SelectItem
                          key={country.____id____}
                          value={country.____id____}
                        >
                          {country.____label____}
                        </SelectItem>
                      ))
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1.5 block text-xs">Phone Number</Label>
              <Input
                className="h-8 rounded-lg text-sm"
                placeholder="(555) 123-4567"
                {...form.register("phone")}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                className="h-8 rounded-lg"
                disabled={createState === "loading"}
                isLoading={createState === "loading"}
              >
                {createState === "loading" ? "Saving..." : "Save Address"}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <RadioGroup
            className="gap-2"
            value={value}
            onValueChange={(val) => {
              if (val === "new") {
                setShowNewAddress(true);
              } else {
                onChange(val);
              }
            }}
          >
            {addressesLoading ? (
              <div className="p-4 text-sm text-muted-foreground">
                Loading addresses...
              </div>
            ) : addresses.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">
                No addresses found
              </div>
            ) : (
              addresses.map((address) => (
                <div
                  key={address.id}
                  className="relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring"
                >
                  <RadioGroupItem
                    value={address.id}
                    id={`${id}-${address.id}`}
                    aria-describedby={`${id}-${address.id}-description`}
                    className="order-1 after:absolute after:inset-0"
                  />
                  <div className="grid grow gap-2">
                    <Label htmlFor={`${id}-${address.id}`}>
                      {address.company ||
                        `${address.firstName} ${address.lastName}`}{" "}
                      {address.phone && (
                        <span className="text-xs font-normal leading-[inherit] text-muted-foreground">
                          ({address.phone})
                        </span>
                      )}
                    </Label>
                    <p
                      id={`${id}-${address.id}-description`}
                      className="text-xs text-muted-foreground"
                    >
                      {[
                        address.address1,
                        address.address2,
                        [address.city, address.province, address.postalCode]
                          .filter(Boolean)
                          .join(", "),
                      ]
                        .filter(Boolean)
                        .join(", ")}
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
                <Label htmlFor={`${id}-new`}>Create New Address</Label>
              </div>
            </div>
          </RadioGroup>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Utility function for saving provider
const useProviderSave = () => {
  const shippingProviderList = useList("ShippingProvider");
  const { createWithData: createProvider, state: createState } =
    useCreateItem(shippingProviderList);

  const getFunctionFields = (providerId) => {
    const functionSuffix = providerId.toLowerCase();
    return {
      createLabelFunction: `${functionSuffix}`,
      getRatesFunction: `${functionSuffix}`,
      validateAddressFunction: `${functionSuffix}`,
      trackShipmentFunction: `${functionSuffix}`,
      cancelLabelFunction: `${functionSuffix}`,
    };
  };

  const handleSaveProvider = async ({
    name,
    accessToken,
    selectedAddress,
    isPreset,
    presetId,
    onSuccess,
  }) => {
    if (!selectedAddress || !accessToken) {
      console.error("Missing required fields");
      return;
    }

    try {
      const result = await createProvider({
        data: {
          name,
          fromAddress: { connect: { id: selectedAddress } },
          isActive: true,
          accessToken,
          ...(isPreset
            ? {
                ...getFunctionFields(presetId),
                metadata: {
                  source: "preset",
                  presetId,
                },
              }
            : {}),
        },
      });

      if (result?.id) {
        onSuccess?.(result);
      }
    } catch (error) {
      console.error("Failed to create provider:", error);
    }
  };

  return { handleSaveProvider, createState };
};

// PresetTab Tab Component
function PresetTabContent({
  provider,
  providerProps,
  onNameChange,
  onSuccess,
}) {
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [accessToken, setAccessToken] = useState("");
  const [name, setName] = useState(provider.name);
  const { handleSaveProvider, createState } = useProviderSave();

  // Update name when provider changes
  useEffect(() => {
    setName(provider.name);
    onNameChange?.(provider.name);
  }, [provider.name, onNameChange]);

  const handleSave = () => {
    handleSaveProvider({
      name,
      accessToken,
      selectedAddress,
      isPreset: true,
      presetId: provider.id,
      onSuccess,
    });
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    onNameChange?.(newName);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-1.5 block text-xs">Name</Label>
        <Input
          className="h-8 rounded-lg text-sm"
          placeholder="Provider name"
          value={name}
          onChange={handleNameChange}
        />
      </div>
      <div>
        <Label className="mb-1.5 block text-xs">Access Token</Label>
        <Input
          type="password"
          className="h-8 rounded-lg text-sm"
          placeholder={`Enter your ${provider.name} API key`}
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
        />
      </div>

      <AddressSelect value={selectedAddress} onChange={setSelectedAddress} />

      <div className="flex justify-end pt-4 border-t">
        <Button
          size="sm"
          className="h-8 rounded-lg"
          onClick={handleSave}
          disabled={
            !name ||
            !selectedAddress ||
            !accessToken ||
            createState === "loading"
          }
          isLoading={createState === "loading"}
        >
          {createState === "loading" ? "Creating..." : "Create Provider"}
        </Button>
      </div>
    </div>
  );
}

// Update the NewProviderTabContent component
function NewProviderTabContent({ providerProps, onSuccess, defaultPreset }) {
  const [activeTab, setActiveTab] = useState("general");
  const [selectedPreset, setSelectedPreset] = useState(
    defaultPreset?.id || "custom"
  );
  const { handleSaveProvider, createState } = useProviderSave();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [accessToken, setAccessToken] = useState("");
  const [name, setName] = useState(() => {
    if (defaultPreset?.id) {
      return defaultPreset.name;
    }
    return "";
  });
  const [functions, setFunctions] = useState(() => {
    if (defaultPreset?.id) {
      const presetId = defaultPreset.id.toLowerCase();
      return {
        createLabelFunction: presetId,
        getRatesFunction: presetId,
        validateAddressFunction: presetId,
        trackShipmentFunction: presetId,
        cancelLabelFunction: presetId,
      };
    }
    return {
      createLabelFunction: "",
      getRatesFunction: "",
      validateAddressFunction: "",
      trackShipmentFunction: "",
      cancelLabelFunction: "",
    };
  });

  // Update name and functions when defaultPreset changes
  useEffect(() => {
    if (defaultPreset?.id) {
      const presetId = defaultPreset.id.toLowerCase();
      setName(defaultPreset.name);
      setFunctions({
        createLabelFunction: presetId,
        getRatesFunction: presetId,
        validateAddressFunction: presetId,
        trackShipmentFunction: presetId,
        cancelLabelFunction: presetId,
      });
    }
  }, [defaultPreset]);

  const functionDescriptions = {
    createLabelFunction: {
      label: "Create Label Function",
      description:
        "Function that creates a shipping label. Receives order details, selected rate, and returns label data.",
    },
    getRatesFunction: {
      label: "Get Rates Function",
      description:
        "Function that fetches shipping rates. Receives package dimensions, weight, addresses, and returns available rates.",
    },
    validateAddressFunction: {
      label: "Validate Address Function",
      description:
        "Function that validates shipping addresses. Receives address details and returns validation results.",
    },
    trackShipmentFunction: {
      label: "Track Shipment Function",
      description:
        "Function that tracks shipments. Receives tracking number and returns tracking status.",
    },
    cancelLabelFunction: {
      label: "Cancel Label Function",
      description:
        "Function that cancels a shipping label. Receives label ID and handles cancellation with the provider.",
    },
  };

  const fieldGroups = {
    general: {
      icon: KeyRound,
      label: "General",
      Component: () => (
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 block text-xs">Name</Label>
            <Input
              className="h-8 rounded-lg text-sm"
              placeholder="Provider name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Access Token</Label>
            <Input
              type="password"
              className="h-8 rounded-lg text-sm"
              placeholder="Enter access token"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
            />
          </div>
          <AddressSelect
            value={selectedAddress}
            onChange={setSelectedAddress}
          />
        </div>
      ),
    },
    functions: {
      icon: Code2,
      label: "Functions",
      Component: () => (
        <div className="space-y-6">
          {Object.entries(functionDescriptions).map(
            ([key, { label, description }]) => (
              <div key={key} className="space-y-2">
                <div>
                  <Label className="mb-1.5 block text-xs">{label}</Label>
                  <Input
                    className="h-8 rounded-lg text-sm"
                    placeholder={`Enter ${label.toLowerCase()}`}
                    value={functions[key]}
                    onChange={(e) =>
                      setFunctions((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            )
          )}
        </div>
      ),
    },
  };

  const renderContent = () => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full border-b justify-start rounded-none h-9 bg-transparent p-0">
        {Object.entries(fieldGroups).map(([key, group]) => (
          <TabsTrigger
            key={key}
            value={key}
            className="uppercase tracking-wide -mb-1 text-[11px] relative h-8 rounded-none border-b-2 border-b-transparent bg-transparent px-3 pb-2 pt-2 font-medium text-muted-foreground/80 hover:text-foreground data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
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

      <div className="mt-4">
        {Object.entries(fieldGroups).map(([key, group]) => (
          <TabsContent key={key} value={key} className="px-4">
            <group.Component />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );

  return (
    <div className="space-y-6">
      {renderContent()}

      <div className="flex justify-end border-t p-4">
        <Button
          size="sm"
          className="h-8 rounded-lg"
          onClick={() => {
            handleSaveProvider({
              name,
              accessToken,
              selectedAddress,
              isPreset: !!defaultPreset,
              presetId: defaultPreset?.id || selectedPreset,
              onSuccess,
              ...functions,
            });
          }}
          disabled={
            !name ||
            !selectedAddress ||
            !accessToken ||
            createState === "loading"
          }
          isLoading={createState === "loading"}
        >
          {createState === "loading"
            ? "Creating..."
            : defaultPreset
              ? `Create ${defaultPreset.name} Provider`
              : "Create Provider"}
        </Button>
      </div>
    </div>
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
    length: "5",
    width: "5",
    height: "5",
    unit: "in",
  });
  const [weight, setWeight] = useState({ unit: "oz", value: "5" });
  const [selectedTab, setSelectedTab] = useState("manual");
  const [selectedRate, setSelectedRate] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [noNotification, setNoNotification] = useState(false);
  const [name, setName] = useState("");

  const fulfillmentList = useList("Fulfillment");
  const { createWithData: createFulfillment, state: fulfillmentState } =
    useCreateItem(fulfillmentList);
  const shippingProviderList = useList("ShippingProvider");
  const {
    create,
    props: createProps,
    state: shippingProviderState,
    error: shippingProviderError,
  } = useCreateItem(shippingProviderList);

  console.log({ shippingProviderError });

  const [
    createLabel,
    { loading: createLabelLoading, error: createLabelError },
  ] = useMutation(CREATE_PROVIDER_SHIPPING_LABEL, {
    refetchQueries: ["GetOrder"],
  });

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

  // Handle provider deletion
  const handleProviderDelete = (provider) => {
    // If the deleted provider was selected, find its preset equivalent
    if (selectedTab === provider.id) {
      const metadata = provider.metadata || {};
      if (metadata.source === "preset" && metadata.presetId) {
        // Switch back to the preset version
        setSelectedTab(metadata.presetId);
      } else {
        // If it wasn't a preset or we can't determine the preset, go to manual
        setSelectedTab("manual");
      }
    }
  };

  // Handle provider creation success
  const handleProviderCreated = (provider) => {
    // Select the newly created provider
    setSelectedTab(provider.id);
  };

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
          dimensions={dimensions}
          setDimensions={setDimensions}
          weight={weight}
          setWeight={setWeight}
        />
      ),
    },
    ...computedProviders.map((provider) => ({
      id: provider.id,
      label: provider.name,
      icon: provider.icon,
      Component: () => (
        <ProviderTabContent
          provider={provider}
          selectedRate={selectedRate}
          setSelectedRate={setSelectedRate}
          createLabelError={createLabelError}
          createLabelLoading={createLabelLoading}
          handleCreateLabel={handleCreateLabel}
          hasSelectedItems={hasSelectedItems}
          order={order}
          onRateSelect={handleRateSelect}
          dimensions={dimensions}
          weight={weight}
        />
      ),
    })),
  ];

  // Get the preset if we're creating from a preset
  const presetProviders = [
    { id: "shippo", name: "Shippo" },
    { id: "shipengine", name: "ShipEngine" },
  ];
  const selectedPreset = presetProviders.find((p) => p.id === selectedTab);
  const isCreatingProvider = selectedTab === "new" || selectedPreset;

  return (
    <div className="rounded-lg border">
      <CardContent className="p-0 space-y-5">
        {/* Shipping Method Selection */}
        <div className="space-y-4">
          <div className="px-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium uppercase text-xs tracking-wider text-muted-foreground mb-2 mt-4">
                Shipping Method
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <Select value={selectedTab} onValueChange={setSelectedTab}>
                <SelectTrigger className="shadow-sm w-auto gap-6 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0 text-xs font-medium opacity-90 h-8 rounded-lg">
                  <SelectValue placeholder="Select shipping method" />
                </SelectTrigger>
                <SelectContent className="[&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span>svg]:text-muted-foreground/80 [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2">
                  <SelectGroup>
                    <SelectLabel className="text-muted-foreground font-normal text-xs ps-2">
                      Shipping Providers
                    </SelectLabel>
                    <SelectItem value="manual" className="text-xs font-medium">
                      <span className="flex items-center gap-2">
                        <Package
                          className="opacity-60"
                          size={10}
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                        <span className="truncate uppercase tracking-wide opacity-75 font-medium">
                          Manual
                        </span>
                      </span>
                    </SelectItem>
                    {providers.map((provider) => (
                      <SelectItem
                        key={provider.id}
                        value={provider.id}
                        className="text-xs font-medium"
                      >
                        <span className="flex items-center gap-2">
                          <StatusIndicator provider={provider} />
                          <span className="truncate uppercase tracking-wide opacity-75 font-medium">
                            {provider.name}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>

                  <SelectGroup>
                    <SelectLabel className="text-muted-foreground font-normal text-xs ps-2">
                      Add Provider
                    </SelectLabel>
                    <SelectItem value="new" className="text-xs font-medium">
                      <span className="flex items-center gap-2">
                        <Settings
                          className="opacity-60"
                          size={10}
                          strokeWidth={2}
                        />
                        <span className="truncate uppercase tracking-wide opacity-75 font-medium">
                          Custom Provider
                        </span>
                      </span>
                    </SelectItem>
                    {presetProviders.map((preset) => (
                      <SelectItem
                        key={preset.id}
                        value={preset.id}
                        className="text-xs font-medium"
                      >
                        <span className="flex items-center gap-2">
                          <StatusIndicator provider={preset} isPreset={true} />
                          <span className="truncate uppercase tracking-wide opacity-75 font-medium">
                            {preset.name} Provider
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {selectedTab !== "manual" && !isCreatingProvider && (
                <ProviderActionsInline
                  provider={providers.find((p) => p.id === selectedTab)}
                  onProviderToggle={onProviderToggle}
                  onDelete={handleProviderDelete}
                >
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <MoreVertical />
                  </Button>
                </ProviderActionsInline>
              )}
            </div>
          </div>

          {/* Package Dimensions Section - Only show when not creating provider */}
          {!isCreatingProvider && (
            <div className="px-4">
              <div className="flex flex-col gap-2">
                <h3 className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
                  Package Dimensions
                </h3>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="[&_svg]:opacity-75 [&_svg]:size-3.5 gap-3 h-7"
                      >
                        <Container />
                        {dimensions.length} × {dimensions.width} ×{" "}
                        {dimensions.height} {dimensions.unit}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-fit p-3">
                      <DimensionsInput
                        dimensions={dimensions}
                        setDimensions={setDimensions}
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="[&_svg]:opacity-75 [&_svg]:size-3.5 gap-3 h-7"
                      >
                        <Weight />
                        {weight.value} {weight.unit}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-fit p-3">
                      <WeightInput weight={weight} setWeight={setWeight} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}

          {isCreatingProvider ? (
            <NewProviderTabContent
              providerProps={createProps}
              onSuccess={handleProviderCreated}
              defaultPreset={selectedPreset}
            />
          ) : (
            <div className="px-4 pb-4">
              {tabsConfig.find((tab) => tab.id === selectedTab)?.Component()}
            </div>
          )}
        </div>
      </CardContent>
    </div>
  );
}
