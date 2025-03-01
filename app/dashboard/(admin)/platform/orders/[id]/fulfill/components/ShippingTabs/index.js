"use client";

import { useState } from "react";
import { useMutation, gql } from "@keystone-6/core/admin-ui/apollo";
import { useList } from "@keystone/keystoneProvider";
import { useCreateItem } from "@keystone/utils/useCreateItem";
import { Button } from "@ui/button";
import { Package, Settings, MoreVertical, Container, Weight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from "@ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
import { DimensionsInput } from "./DimensionsInput";
import { WeightInput } from "./WeightInput";
import { ManualTabContent } from "./ManualTabContent";
import { ProviderTabContent } from "./ProviderTabContent";
import { StatusIndicator } from "./StatusIndicator";
import { ProviderActionsInline } from "./ProviderActionsInline";
import { PresetTabContent } from "./PresetTabContent";
import { NewProviderTabContent } from "./NewProviderTabContent";


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

export function ShippingTabs({
  providers = [],
  order,
  onRateSelect,
  onProviderToggle,
  selectedQuantities,
  setSelectedQuantities,
  refetchProviders,
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

  const [
    createLabel,
    { loading: createLabelLoading, error: createLabelError },
  ] = useMutation(CREATE_PROVIDER_SHIPPING_LABEL, {
    refetchQueries: ["GetOrder"],
  });

  const selectedItemsCount = Object.values(selectedQuantities).reduce(
    (sum, qty) => sum + (parseInt(qty) || 0),
    0
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

      const result = await createFulfillment({
        data: fulfillmentData,
        relatedListKey: 'order',
        relatedListId: order.id
      });
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

  // Get the preset if we're creating from a preset
  const presetProviders = [
    { id: "shippo", name: "Shippo" },
    { id: "shipengine", name: "ShipEngine" },
  ];
  const selectedPreset = presetProviders.find((p) => p.id === selectedTab);
  const isCreatingProvider = selectedTab === "new" || selectedPreset;

  return (
    <div className="rounded-lg border">
      <div>
        {selectedItemsCount === 0 ? (
          <div className="m-2 flex h-44 items-center justify-center rounded-lg border bg-muted/40">
            <div className="text-center">
              <Package
                className="mx-auto h-7 w-7 text-muted-foreground/50"
                aria-hidden="true"
              />
              <p className="mt-2 text-sm font-medium">
                Please select atleast 1 item to fulfill
              </p>
              <p className="text-sm text-muted-foreground">
                Select items from the list to begin fulfillment
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
              <p className="px-4 py-3 font-medium uppercase text-xs tracking-wider text-muted-foreground border-b">
                Fulfilling {selectedItemsCount}{" "}
                {selectedItemsCount === 1 ? "item" : "items"}...
              </p>

            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
                  Shipping Method
                </h3>
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <Select 
                      value={selectedTab} 
                      onValueChange={setSelectedTab}
                      onOpenChange={(open) => {
                        if (!open) {
                          // Small delay to prevent immediate blur
                          setTimeout(() => {
                            const input = document.querySelector('input:focus');
                            if (input) input.focus();
                          }, 0);
                        }
                      }}
                    >
                      <SelectTrigger className="shadow-sm gap-6 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0 text-xs font-medium h-8 rounded-lg text-foreground">
                        <SelectValue placeholder="Select shipping method" />
                      </SelectTrigger>
                      <SelectContent className="[&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span>svg]:text-muted-foreground/80 [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2">
                        <SelectGroup>
                          <SelectLabel className="text-muted-foreground font-normal text-xs ps-2">
                            Shipping Providers
                          </SelectLabel>
                          <SelectItem
                            value="manual"
                            className="text-xs font-medium"
                          >
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
                                <StatusIndicator
                                  provider={preset}
                                  isPreset={true}
                                />
                                <span className="truncate uppercase tracking-wide opacity-75 font-medium">
                                  {preset.name} Provider
                                </span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
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

              {!isCreatingProvider && (
                <div className="space-y-2">
                  <h3 className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
                    Package Dimensions
                  </h3>
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-2">
                          <Container className="h-4 w-4" />
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
                        <Button variant="outline" size="sm" className="h-8 gap-2">
                          <Weight className="h-4 w-4" />
                          {weight.value} {weight.unit}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-fit p-3">
                        <WeightInput weight={weight} setWeight={setWeight} />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              <div>
                {isCreatingProvider ? (
                  selectedPreset ? (
                    <PresetTabContent
                      provider={selectedPreset}
                      providerProps={createProps}
                      onNameChange={setName}
                      onSuccess={handleProviderCreated}
                      refetchProviders={refetchProviders}
                    />
                  ) : (
                    <NewProviderTabContent
                      providerProps={createProps}
                      onSuccess={handleProviderCreated}
                      refetchProviders={refetchProviders}
                    />
                  )
                ) : selectedTab === "manual" ? (
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
                ) : (
                  <ProviderTabContent
                    provider={providers.find((p) => p.id === selectedTab)}
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
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
