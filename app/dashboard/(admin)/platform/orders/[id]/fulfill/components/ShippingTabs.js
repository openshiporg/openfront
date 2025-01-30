"use client";

import {
  useState,
  useContext,
  createContext,
  forwardRef,
  useEffect,
} from "react";
import {
  Plus,
  MoreHorizontal,
  PenSquare,
  Trash2,
  X,
  CreditCard,
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
} from "@ui/select";
import { CreateDialog } from "../page";
import { ShippingProviderRates } from "./ShippingProviderRates";
import { CardContent } from "@ui/card";
import { DimensionsInput } from "./DimensionsInput";
import { WeightInput } from "./WeightInput";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@keystone/utils/cn";
import { ShippingProviderCard } from "./ShippingProviderCard";
import { useDrawer } from "@keystone/themes/Tailwind/orion/components/Modals/drawer-context";
import { useList } from "@keystone/keystoneProvider";
import { DeleteButton } from "@keystone/themes/Tailwind/orion/components/EditItemDrawer";
import { Alert, AlertDescription } from "@ui/alert";
import { Skeleton } from "@ui/skeleton";
import { gql, useMutation } from "@keystone-6/core/admin-ui/apollo";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import { useDeleteItem } from "@keystone/themes/Tailwind/orion/components/EditItemDrawer";

const TabsListVariantContext = createContext("line");

const Tabs = forwardRef((props, ref) => {
  return <TabsPrimitive.Root {...props} />;
});
Tabs.displayName = "Tabs";

const TabsList = forwardRef(({ className, children, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "flex w-full border-b border-zinc-200 dark:border-zinc-800",
      className
    )}
    {...props}
  >
    {children}
  </TabsPrimitive.List>
));
TabsList.displayName = "TabsList";

const TabsTrigger = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5",
        "text-sm font-medium text-zinc-500 dark:text-zinc-400",
        "transition-all relative -mb-px",
        "data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-500",
        "hover:text-zinc-900 dark:hover:text-zinc-100",
        "after:absolute after:left-0 after:bottom-0 after:right-0 after:h-0.5",
        "after:bg-transparent after:content-['']",
        "data-[state=active]:after:bg-blue-600 dark:data-[state=active]:after:bg-blue-500",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
});
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("outline-none mt-4", className)}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";

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

const carrierIcons = {
  ups: "https://raw.githubusercontent.com/gil--/shipping_carrier_icons/main/svg/ups.svg",
  usps: "https://raw.githubusercontent.com/gil--/shipping_carrier_icons/main/svg/usps.svg",
  fedex:
    "https://raw.githubusercontent.com/gil--/shipping_carrier_icons/main/svg/fedex.svg",
  dhl: "https://raw.githubusercontent.com/gil--/shipping_carrier_icons/main/svg/dhl.svg",
  bpost:
    "https://raw.githubusercontent.com/gil--/shipping_carrier_icons/main/svg/bpost.svg",
};

export function ProviderActions({ provider, onProviderToggle }) {
  const { openEditDrawer } = useDrawer();
  const list = useList("ShippingProvider");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { handleDelete } = useDeleteItem("ShippingProvider");

  const handleDeleteProvider = async () => {
    const result = await handleDelete(provider.id, provider.name);
    if (result) {
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-4 w-4 [&_svg]:size-3 ml-2"
          >
            <MoreHorizontal />
          </Button>
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
            onClick={() => setShowDeleteDialog(true)}
            className="gap-2 font-medium tracking-wide text-xs text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
            DELETE PROVIDER
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Provider</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {provider.name}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProvider}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ProviderActionsMobile({ provider, onProviderToggle }) {
  const { openEditDrawer } = useDrawer();
  const list = useList("ShippingProvider");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { handleDelete } = useDeleteItem("ShippingProvider");

  const handleDeleteProvider = async () => {
    const result = await handleDelete(provider.id, provider.name);
    if (result) {
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-10 w-12">
            <MoreHorizontal />
          </Button>
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
            onClick={() => setShowDeleteDialog(true)}
            className="gap-2 font-medium tracking-wide text-xs text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
            DELETE PROVIDER
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Provider</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {provider.name}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProvider}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ShippingTabs({
  providers,
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
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedRate, setSelectedRate] = useState(null);
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [labelError, setLabelError] = useState(null);

  // Set initial active provider or update when providers change
  const activeProvider = providers.find((p) => p.isActive)?.id;
  if (!selectedProvider && activeProvider) {
    setSelectedProvider(activeProvider);
  } else if (
    selectedProvider &&
    !providers.find((p) => p.id === selectedProvider)
  ) {
    // If selected provider was deleted, select another active one or null
    setSelectedProvider(activeProvider || null);
  }

  const [createLabel] = useMutation(CREATE_PROVIDER_SHIPPING_LABEL, {
    onCompleted: (data) => {
      setIsCreatingLabel(false);
    },
    onError: (error) => {
      setIsCreatingLabel(false);
      setLabelError(error.message);
    },
    refetchQueries: ["GetOrder"],
  });

  const shouldUseSelect = providers.length > 4;

  const isValidDimensions = () => {
    return (
      parseFloat(dimensions.length) > 0 &&
      parseFloat(dimensions.width) > 0 &&
      parseFloat(dimensions.height) > 0 &&
      parseFloat(weight.value) > 0
    );
  };

  const hasSelectedItems = Object.values(selectedQuantities).some(
    (qty) => parseInt(qty) > 0
  );

  const handleCreateLabel = async () => {
    if (!selectedRate || !hasSelectedItems) return;

    setIsCreatingLabel(true);
    setLabelError(null);

    try {
      await createLabel({
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
      setLabelError(error.message);
    }
  };

  if (providers.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          No shipping providers configured
        </p>
        <CreateDialog
          title="Create Shipping Provider"
          listKey="ShippingProvider"
        >
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Provider
          </Button>
        </CreateDialog>
      </div>
    );
  }

  const handleRateSelect = (rate) => {
    setSelectedRate(rate);
    onRateSelect?.(rate);
  };

  return (
    <div className="rounded-lg border">
      <CardContent className="p-4">
        {labelError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{labelError}</AlertDescription>
          </Alert>
        )}
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

        {/* Shipping Providers Selection */}
        <div>
          <h3 className="font-medium uppercase text-xs tracking-wider text-muted-foreground mb-2">
            Shipping Providers
          </h3>

          {/* Provider Selection - Select or Tabs based on count */}
          <div className={cn(shouldUseSelect ? "block" : "md:hidden")}>
            <div className="flex items-center gap-2 mb-4">
              <Select
                value={selectedProvider}
                onValueChange={setSelectedProvider}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {providers.map((provider) => (
                      <SelectItem
                        key={provider.id}
                        value={provider.id}
                        className={cn(!provider.isActive && "opacity-75")}
                      >
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {selectedProvider && (
                <ProviderActionsMobile
                  provider={providers.find((p) => p.id === selectedProvider)}
                  onProviderToggle={onProviderToggle}
                />
              )}
              <CreateDialog
                title="Create Shipping Provider"
                listKey="ShippingProvider"
              >
                <Button variant="outline" size="icon" className="h-10 w-12">
                  <Plus />
                </Button>
              </CreateDialog>
            </div>
          </div>

          {/* Desktop Tabs - Only show if less than 5 providers */}
          {!shouldUseSelect && (
            <div className="hidden md:block">
              <Tabs
                value={selectedProvider}
                onValueChange={setSelectedProvider}
                className="w-full"
              >
                <TabsList className="w-full justify-start mb-4">
                  {providers.map((provider) => (
                    <TabsTrigger
                      key={provider.id}
                      value={provider.id}
                      className={cn(!provider.isActive && "opacity-75")}
                    >
                      {provider.name}
                      <ProviderActions
                        provider={provider}
                        onProviderToggle={onProviderToggle}
                      />
                    </TabsTrigger>
                  ))}

                  <CreateDialog
                    title="Create Shipping Provider"
                    listKey="ShippingProvider"
                    defaultValues={{ isActive: true }}
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      className={cn(
                        "inline-flex items-center justify-center whitespace-nowrap",
                        "text-sm font-medium text-zinc-500",
                        "transition-all relative -mb-px",
                        "hover:text-zinc-900",
                        "h-4 w-4 mt-2",
                        "[&_svg]:size-3"
                      )}
                    >
                      <Plus />
                    </Button>
                  </CreateDialog>
                </TabsList>
              </Tabs>
            </div>
          )}

          {/* Content */}
          {selectedProvider && (
            <div className="mt-4">
              {!providers.find((p) => p.id === selectedProvider)?.isActive ? (
                <div className="rounded-lg bg-muted/40 border p-4 text-center space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">
                    <Plus className="h-6 w-6 text-zinc-600" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Inactive Provider</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      This shipping provider is currently inactive. Activate it
                      to start generating shipping labels.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onProviderToggle(selectedProvider)}
                    >
                      Activate Provider
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {selectedRate && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn("flex flex-col", "sticky top-4", "h-fit")}
                    >
                      <div className="flex justify-between items-start p-2 rounded-lg bg-muted/40 border">
                        <div className="flex flex-wrap gap-4">
                          {carrierIcons[selectedRate.carrier.toLowerCase()] ? (
                            <img
                              src={
                                carrierIcons[selectedRate.carrier.toLowerCase()]
                              }
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
                              {selectedRate.provider} •{" "}
                              {selectedRate.estimatedDays} days
                            </span>
                            <span className="text-sm font-medium">
                              ${selectedRate.price}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end h-full gap-3.5">
                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => setSelectedRate(null)}
                            className="[&_svg]:size-3 h-5 w-5 border"
                          >
                            <X />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="[&_svg]:size-3 h-6 px-2 flex items-center gap-2"
                            onClick={handleCreateLabel}
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
                    </motion.div>
                  )}
                  <div>
                    <h3 className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground mb-1">
                    Shipping Rates
                    </h3>
                    <ShippingProviderRates
                      provider={providers.find(
                        (p) => p.id === selectedProvider
                      )}
                      order={order}
                      onRateSelect={handleRateSelect}
                      dimensions={dimensions}
                      weight={weight}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </div>
  );
}
