"use client";

import { useState } from "react";
import useSWR from "swr";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DimensionsInput } from "./DimensionsInput";
import { WeightInput } from "./WeightInput";
import type {
  ShippingProvider,
  ShippingRate,
  Order,
  Dimensions,
  Weight,
} from "../../types";
import { getRatesForOrder } from "@/features/platform/orders/actions";

// A manual map for carrier icons. Add any carriers you want to override here.
const manualCarrierIconsMap: Record<string, string> = {
  "stamps.com":
    "https://developer.stamps.com/soap-api/reference/images/logo_stamps_blue.svg",
  // You can add more manual icons if needed.
};

// Helper function to get the carrier icon URL.
// 1. Check manualCarrierIconsMap first.
// 2. Otherwise, if the carrier key is not marked as failed, use the GitHub URL fallback.
// 3. If it's been marked as failed or no fallback is available, return null.
export function getCarrierIconUrl(
  carrier: string,
  failedSet: Set<string>
): string | null {
  const key = carrier.toLowerCase();
  if (manualCarrierIconsMap[key]) {
    return manualCarrierIconsMap[key];
  }
  if (!failedSet.has(key)) {
    return `https://raw.githubusercontent.com/gil--/shipping_carrier_icons/main/svg/${key}.svg`;
  }
  return null;
}

// Skeleton loader for shipping rates
function RatesSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between w-full h-[54px] p-3 border rounded-lg"
        >
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-3 w-[60px]" />
          </div>
          <Skeleton className="h-4 w-[60px]" />
        </div>
      ))}
    </div>
  );
}

interface ProviderTabContentProps {
  provider?: ShippingProvider;
  selectedRate: ShippingRate | null;
  setSelectedRate: (rate: ShippingRate | null) => void;
  createLabelError: Error | null;
  createLabelLoading: boolean;
  handleCreateLabel: () => Promise<void>;
  hasSelectedItems: boolean;
  order: Order;
  onRateSelect: (rate: ShippingRate) => void;
  dimensions: Dimensions;
  weight: Weight;
  onDimensionsChange?: (dimensions: Dimensions) => void;
  onWeightChange?: (weight: Weight) => void;
}

export function ProviderTabContent({
  provider,
  selectedRate,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setSelectedRate,
  createLabelError,
  createLabelLoading,
  handleCreateLabel,
  hasSelectedItems,
  order,
  onRateSelect,
  dimensions: propDimensions,
  weight: propWeight,
  onDimensionsChange,
  onWeightChange,
}: ProviderTabContentProps) {
  // Track failed carrier icons
  const [failedIcons, setFailedIcons] = useState<Set<string>>(new Set());

  // Pagination and sorting state
  const [sortBy, setSortBy] = useState<"carrier" | "price" | "speed">("price");
  const [currentPage, setCurrentPage] = useState(1);
  const RATES_PER_PAGE = 4;

  // Local state for dimensions and weight
  const [dimensions, setDimensions] = useState<Dimensions>(propDimensions);
  const [weight, setWeight] = useState<Weight>(propWeight);

  // Handle dimension changes
  const handleDimensionsChange = (newDimensions: Dimensions) => {
    setDimensions(newDimensions);
    onDimensionsChange?.(newDimensions);
  };

  // Handle weight changes
  const handleWeightChange = (newWeight: Weight) => {
    setWeight(newWeight);
    onWeightChange?.(newWeight);
  };

  // Prepare dimensions data for the API call
  const dimensionsData = {
    length: parseFloat(dimensions.length),
    width: parseFloat(dimensions.width),
    height: parseFloat(dimensions.height),
    weight: parseFloat(weight.value),
    unit: dimensions.unit,
    weightUnit: weight.unit,
  };

  // Function to sort rates
  const getSortedRates = (ratesData: ShippingRate[]) => {
    // Sort rates based on the selected sort option
    const sortedRates = [...ratesData];

    if (sortBy === "carrier") {
      sortedRates.sort((a, b) => a.carrier.localeCompare(b.carrier));
    } else if (sortBy === "price") {
      sortedRates.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === "speed") {
      sortedRates.sort(
        (a, b) => parseInt(a.estimatedDays) - parseInt(b.estimatedDays)
      );
    }

    // Get paginated rates
    const startIndex = (currentPage - 1) * RATES_PER_PAGE;
    const endIndex = startIndex + RATES_PER_PAGE;
    return {
      paginatedRates: sortedRates.slice(startIndex, endIndex),
      totalPages: Math.ceil(sortedRates.length / RATES_PER_PAGE),
    };
  };

  // Create a unique key for SWR based on all dependencies
  const shouldFetch = provider && hasSelectedItems;
  const swrKey = shouldFetch
    ? ["shipping-rates", order.id, provider?.id, JSON.stringify(dimensionsData)]
    : null;

  // Use SWR to fetch rates
  const {
    data: rates,
    error: rateError,
    isLoading: isLoadingRates,
    mutate: refetchRates,
  } = useSWR(
    swrKey,
    async () => {
      try {
        const response = await getRatesForOrder(
          order.id,
          provider!.id,
          dimensionsData
        );

        // Handle the KeystoneResponse
        if (response.success) {
          // Ensure we return an array, even if getRatesForOrder is null/undefined
          return response.data?.getRatesForOrder ?? [];
        } else {
          // Throw the error message from the response
          throw new Error(response.error || 'Failed to fetch shipping rates');
        }
      } catch (error) {
        console.error("Error fetching rates:", error);
        throw error instanceof Error
          ? error
          : new Error("Failed to fetch shipping rates");
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
      errorRetryCount: 2,
      onError: (err) => {
        console.error('SWR error fetching rates:', err);
      }
    }
  );

  // Function to manually retry fetching rates
  const handleRetryFetchRates = () => {
    refetchRates();
  };

  if (!provider) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Provider not found
      </div>
    );
  }

  if (!hasSelectedItems) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Please select items to ship
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
          Package Dimensions
        </h3>
        <DimensionsInput
          dimensions={dimensions}
          setDimensions={handleDimensionsChange}
        />
      </div>

      <div className="space-y-2">
        <h3 className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
          Package Weight
        </h3>
        <WeightInput weight={weight} setWeight={handleWeightChange} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
            Shipping Rates
          </h3>

          <div className="inline-flex -space-x-px rounded-lg shadow-sm shadow-black/5 rtl:space-x-reverse">
            <Button
              variant="outline"
              className={`h-6 px-1.5 text-xs rounded-none shadow-none first:rounded-s-lg focus-visible:z-10 ${
                sortBy === "carrier" ? "bg-accent" : ""
              }`}
              onClick={() => {
                setSortBy("carrier");
                setCurrentPage(1);
              }}
            >
              Carrier
            </Button>
            <Button
              variant="outline"
              className={`h-6 px-1.5 text-xs rounded-none shadow-none focus-visible:z-10 ${
                sortBy === "price" ? "bg-accent" : ""
              }`}
              onClick={() => {
                setSortBy("price");
                setCurrentPage(1);
              }}
            >
              Price
            </Button>
            <Button
              variant="outline"
              className={`h-6 px-1.5 text-xs rounded-none shadow-none last:rounded-e-lg focus-visible:z-10 ${
                sortBy === "speed" ? "bg-accent" : ""
              }`}
              onClick={() => {
                setSortBy("speed");
                setCurrentPage(1);
              }}
            >
              Speed
            </Button>
          </div>
        </div>

        {rateError && (
          <Alert variant="destructive" className="text-xs">
            <AlertCircle className="h-4 w-4" />
            <div className="flex flex-col space-y-2 w-full">
              <AlertDescription>
                {rateError.message ||
                  "Failed to fetch shipping rates. Please try again."}
              </AlertDescription>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetryFetchRates}
                className="self-end"
              >
                Retry
              </Button>
            </div>
          </Alert>
        )}

        {isLoadingRates ? (
          <RatesSkeleton />
        ) : (
          <div className="space-y-2">
            {!rates || rates.length === 0 ? (
              <div className="text-center p-4 text-sm text-muted-foreground flex flex-col items-center gap-2">
                {rateError ? (
                  <>
                    <span>Error loading rates</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetryFetchRates}
                    >
                      Retry
                    </Button>
                  </>
                ) : (
                  "No shipping rates available"
                )}
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {getSortedRates(rates).paginatedRates.map(
                    (rate: ShippingRate) => {
                      const carrierKey = rate.carrier.toLowerCase();
                      const iconUrl = getCarrierIconUrl(
                        rate.carrier,
                        failedIcons
                      );

                      return (
                        <div
                          key={rate.id}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${
                            selectedRate?.id === rate.id
                              ? "border-primary bg-primary/5"
                              : "border-border"
                          }`}
                          onClick={() => onRateSelect(rate)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-6 w-12 flex items-center justify-center">
                              {iconUrl ? (
                                <Image
                                  src={iconUrl}
                                  alt={rate.carrier}
                                  className="h-full w-full object-contain p-0.5"
                                  width={48}
                                  height={24}
                                  onError={() =>
                                    setFailedIcons(
                                      (prev) => new Set([...prev, carrierKey])
                                    )
                                  }
                                />
                              ) : (
                                <span
                                  className="text-sm font-medium"
                                  title={rate.carrier}
                                >
                                  {rate.carrier.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-sm">
                                {rate.service}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {rate.carrier} • {rate.estimatedDays}{" "}
                                {rate.estimatedDays === "1" ? "day" : "days"}
                              </div>
                            </div>
                          </div>
                          <div className="font-medium">
                            ${parseFloat(rate.price).toFixed(2)}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
                {rates.length > RATES_PER_PAGE && (
                  <div className="flex items-center justify-between gap-2 mt-4">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {getSortedRates(rates).totalPages}
                    </div>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className="h-6 w-6"
                      >
                        <ChevronLeft />
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(getSortedRates(rates).totalPages, prev + 1)
                          )
                        }
                        disabled={
                          currentPage === getSortedRates(rates).totalPages
                        }
                        className="h-6 w-6"
                      >

                        <ChevronRight />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {createLabelError && (
        <Alert variant="destructive" className="text-xs">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{createLabelError.message}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleCreateLabel}
        disabled={!selectedRate || createLabelLoading || !hasSelectedItems}
        className="w-full"
      >
        {createLabelLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Label...
          </>
        ) : (
          "Create Shipping Label"
        )}
      </Button>
    </div>
  );
}
