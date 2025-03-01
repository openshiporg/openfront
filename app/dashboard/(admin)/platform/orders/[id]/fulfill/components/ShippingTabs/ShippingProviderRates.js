"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Button } from "@ui/button";
import { Alert, AlertDescription } from "@ui/alert";
import { Skeleton } from "@ui/skeleton";
import { gql, useMutation } from "@keystone-6/core/admin-ui/apollo";
import { Pagination, PaginationContent, PaginationItem } from "@ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@keystone/themes/Tailwind/orion/primitives/default/ui/select";
import Image from "next/image";

// A manual map for carrier icons. Add any carriers you want to override here.
const manualCarrierIconsMap = {
  "stamps.com":
    "https://developer.stamps.com/soap-api/reference/images/logo_stamps_blue.svg",
  // You can add more manual icons if needed.
};

// Helper function to get the carrier icon URL.
// 1. Check manualCarrierIconsMap first.
// 2. Otherwise, if the carrier key is not marked as failed, use the GitHub URL fallback.
// 3. If it's been marked as failed or no fallback is available, return null.
export function getCarrierIconUrl(carrier, failedSet) {
  const key = carrier.toLowerCase();
  if (manualCarrierIconsMap[key]) {
    return manualCarrierIconsMap[key];
  }
  if (!failedSet.has(key)) {
    return `https://raw.githubusercontent.com/gil--/shipping_carrier_icons/main/svg/${key}.svg`;
  }
  return null;
}

const GET_RATES_FOR_ORDER = gql`
  mutation GetRatesForOrder(
    $orderId: ID!
    $providerId: ID!
    $dimensions: DimensionsInput
  ) {
    getRatesForOrder(
      orderId: $orderId
      providerId: $providerId
      dimensions: $dimensions
    ) {
      id
      provider
      service
      carrier
      price
      estimatedDays
    }
  }
`;

function RatesSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between w-full h-[54px] p-2 border rounded-md"
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

export function ShippingProviderRates({
  provider,
  order,
  onRateSelect,
  dimensions,
  weight,
}) {
  const [fetchedRates, setFetchedRates] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [failedIcons, setFailedIcons] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("default");

  const sortedRates = useMemo(() => {
    if (sortBy === "price") {
      return [...fetchedRates].sort(
        (a, b) => parseFloat(a.price) - parseFloat(b.price)
      );
    } else if (sortBy === "delivery") {
      return [...fetchedRates].sort(
        (a, b) => a.estimatedDays - b.estimatedDays
      );
    }
    return fetchedRates;
  }, [fetchedRates, sortBy]);

  const [getRates] = useMutation(GET_RATES_FOR_ORDER, {
    onCompleted: (data) => {
      setFetchedRates(data.getRatesForOrder);
      setError(null);
      setIsLoading(false);
      setCurrentPage(1);
    },
    onError: (error) => {
      setError(error.message);
      setFetchedRates([]);
      setIsLoading(false);
    },
  });

  // Only fetch rates when we have all required data
  useEffect(() => {
    if (!order?.id || !provider?.id || !dimensions || !weight) {
      return;
    }

    const fetchRates = async () => {
      setIsLoading(true);
      setError(null);

      try {
        await getRates({
          variables: {
            orderId: order.id,
            providerId: provider.id,
            dimensions: {
              length: parseFloat(dimensions.length),
              width: parseFloat(dimensions.width),
              height: parseFloat(dimensions.height),
              weight: parseFloat(weight.value),
              unit: dimensions.unit,
              weightUnit: weight.unit,
            },
          },
        });
      } catch (error) {
        console.error("Error getting rates:", error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchRates();
  }, [order?.id, provider?.id, dimensions, weight, getRates]);

  // Don't render anything if provider is not active or missing required data
  if (!provider?.isActive || !order?.id) {
    return null;
  }

  // Pagination: show 4 rates per page.
  const ratesPerPage = 4;
  const totalPages = Math.ceil(sortedRates.length / ratesPerPage);
  const displayedRates = sortedRates.slice(
    (currentPage - 1) * ratesPerPage,
    currentPage * ratesPerPage
  );

  // Function to format estimated days correctly (1 day vs N days).
  const formatDays = (days) => (days === "1" ? "1 day" : `${days} days`);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
          {provider?.name} {" "}
          Rates
        </h3>
        <Select
          value={sortBy}
          onValueChange={(value) => {
            setSortBy(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="shadow-none p-0 border-none w-auto h-auto">
            <div className="uppercase py-1 px-0 text-[10px] text-muted-foreground [&_svg]:size-3 mx-2">
              Sorting by {sortBy}
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="delivery">Shipping Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {/* Sort dropdown */}

      {isLoading ? (
        <RatesSkeleton />
      ) : displayedRates.length > 0 ? (
        <>
          <div className="grid gap-2">
            {displayedRates.map((rate) => {
              const carrierKey = rate.carrier.toLowerCase();
              // Get the icon URL, first trying manual map, then GitHub if not in failedIcons.
              const iconUrl = getCarrierIconUrl(rate.carrier, failedIcons);
              return (
                <Button
                  key={rate.id}
                  variant="outline"
                  className="flex items-center justify-between w-full h-auto p-2 bg-background"
                  onClick={() =>
                    onRateSelect({ ...rate, providerId: provider.id })
                  }
                >
                  <div className="flex flex-wrap gap-4 items-center">
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
                        // Fallback: displaying the first letter with a title tooltip
                        <span
                          className="text-sm font-medium"
                          title={rate.carrier}
                        >
                          {rate.carrier.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">
                        {rate.service}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        <span className="font-normal opacity-80">
                          {provider.name}
                        </span>{" "}
                        • {rate.estimatedDays} {rate.estimatedDays !== "1" ? "days" : "day"}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-medium">${rate.price}</span>
                </Button>
              );
            })}
          </div>
          {/* Pagination Controls */}
          <div className="flex items-center justify-between gap-3 mt-4">
            <p
              className="grow text-xs text-muted-foreground"
              aria-live="polite"
            >
              Page{" "}
              <span className="text-foreground font-medium">{currentPage}</span>{" "}
              of{" "}
              <span className="text-foreground font-medium">{totalPages}</span>
            </p>
            <Pagination className="w-auto">
              <PaginationContent className="gap-3">
                <PaginationItem asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                    aria-disabled={currentPage === 1 ? true : undefined}
                    onClick={() =>
                      currentPage > 1 && setCurrentPage(currentPage - 1)
                    }
                  >
                    <ChevronLeft />
                    Previous
                  </Button>
                </PaginationItem>
                <PaginationItem asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                    aria-disabled={
                      currentPage === totalPages ? true : undefined
                    }
                    onClick={() =>
                      currentPage < totalPages &&
                      setCurrentPage(currentPage + 1)
                    }
                  >
                    Next
                    <ChevronRight />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      ) : (
        <div className="text-sm text-muted-foreground text-center py-4">
          No rates available for this provider
        </div>
      )}
    </div>
  );
}
