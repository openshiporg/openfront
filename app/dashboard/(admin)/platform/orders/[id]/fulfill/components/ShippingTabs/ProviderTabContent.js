"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@ui/button";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
import { CreditCard, X } from "lucide-react";
import { ShippingProviderRates, getCarrierIconUrl } from "./ShippingProviderRates";

export function ProviderTabContent({
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
                  {selectedRate.provider} • {selectedRate.estimatedDays} day{selectedRate.estimatedDays === "1" ? "" : "s"}
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
                              {err?.extensions?.originalError?.message ||
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