"use client";

import { useState } from "react";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { ChevronRight } from "lucide-react";
import { buttonVariants } from "@ui/button";
import { useProviderSave } from "./useProviderSave";
import { AddressSelect } from "./AddressSelect";
import { cn } from "@keystone/utils/cn";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@ui/tooltip";

export function PresetTabContent({
  provider,
  providerProps,
  onNameChange,
  onSuccess,
  refetchProviders,
}) {
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [accessToken, setAccessToken] = useState("");
  const [name, setName] = useState(provider.name);
  const { handleSaveProvider, createState } = useProviderSave();
  const [functions, setFunctions] = useState({
    createLabelFunction: provider.id.toLowerCase(),
    getRatesFunction: provider.id.toLowerCase(),
    validateAddressFunction: provider.id.toLowerCase(),
    trackShipmentFunction: provider.id.toLowerCase(),
    cancelLabelFunction: provider.id.toLowerCase(),
  });

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

  const handleSave = () => {
    handleSaveProvider({
      name,
      accessToken,
      selectedAddress,
      isPreset: true,
      presetId: provider.id,
      onSuccess,
      refetchProviders,
      ...functions,
    });
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    onNameChange?.(newName);
  };

  return (
    <div className="space-y-6">
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
      </div>

      <details className="group">
        <summary className="list-none outline-none [&::-webkit-details-marker]:hidden cursor-pointer">
          <div className="flex gap-2 items-center text-sm">
            <button
              className={cn(
                buttonVariants({ variant: "outline", size: "icon" }),
                "size-5 [&_svg]:size-3 transition-transform group-open:rotate-90"
              )}
            >
              <ChevronRight className="size-3" />
            </button>
            <div className="text-sm uppercase text-muted-foreground font-medium tracking-wide">Functions</div>
          </div>
        </summary>
        <div className="space-y-6 pl-7 mt-4">
          {Object.entries(functionDescriptions).map(
            ([key, { label, description }]) => (
              <div key={key} className="space-y-2">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Label className="block text-sm">{label}</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="[&_svg]:size-3 h-5 w-5"
                          >
                            <Info />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[250px]">
                          <p>{description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
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
              </div>
            )
          )}
        </div>
      </details>

      <div className="mt-6 pt-4 border-t">
        <div className="flex justify-end">
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
    </div>
  );
} 