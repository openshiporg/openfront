"use client";

import { useEffect, useState } from "react";
import { Button } from "@ui/button";
import { Alert, AlertDescription } from "@ui/alert";
import { Skeleton } from "@ui/skeleton";
import { gql, useMutation } from "@keystone-6/core/admin-ui/apollo";

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
      {[1, 2, 3].map((i) => (
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
  const [rates, setRates] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [failedIcons, setFailedIcons] = useState(new Set());

  const [getRates] = useMutation(GET_RATES_FOR_ORDER, {
    onCompleted: (data) => {
      setRates(
        data.getRatesForOrder.sort(
          (a, b) => parseFloat(a.price) - parseFloat(b.price)
        )
      );
      setError(null);
      setIsLoading(false);
    },
    onError: (error) => {
      setError(error.message);
      setRates([]);
      setIsLoading(false);
    },
  });

  const handleGetRates = async () => {
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
    }
  };

  useEffect(() => {
    handleGetRates();
  }, [provider.id, dimensions, weight]);

  if (!provider.isActive) {
    return null;
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <RatesSkeleton />
      ) : rates.length > 0 ? (
        <div className="grid gap-2">
          {rates.map((rate) => (
            <Button
              key={rate.id}
              variant="outline"
              className="flex items-center justify-between w-full h-auto p-2"
              onClick={() => onRateSelect({ ...rate, providerId: provider.id })}
            >
              <div className="flex flex-wrap gap-4">
                {!failedIcons.has(rate.carrier.toLowerCase()) ? (
                  <img
                    src={`https://raw.githubusercontent.com/gil--/shipping_carrier_icons/main/svg/${rate.carrier.toLowerCase()}.svg`}
                    alt={rate.carrier}
                    className="h-6 w-auto mt-0.5"
                    onError={() =>
                      setFailedIcons(
                        (prev) => new Set([...prev, rate.carrier.toLowerCase()])
                      )
                    }
                  />
                ) : (
                  <div className="h-6 px-2 bg-zinc-100 rounded flex items-center">
                    <span className="text-sm font-medium truncate max-w-[100px]">
                      {rate.carrier}
                    </span>
                  </div>
                )}
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {rate.service}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {provider.name} • {rate.estimatedDays} days
                  </span>
                </div>
              </div>
              <span className="text-sm font-medium">${rate.price}</span>
            </Button>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground text-center py-4">
          No rates available for this provider
        </div>
      )}
    </div>
  );
}
