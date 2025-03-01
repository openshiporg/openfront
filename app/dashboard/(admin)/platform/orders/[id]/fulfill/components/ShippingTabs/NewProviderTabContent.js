"use client";

import { useState } from "react";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { ChevronRight, Info } from "lucide-react";
import { buttonVariants } from "@ui/button";
import { useProviderSave } from "./useProviderSave";
import { AddressSelect } from "./AddressSelect";
import { cn } from "@keystone/utils/cn";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@keystone/themes/Tailwind/orion/primitives/default/ui/tooltip";

export function NewProviderTabContent({
  providerProps,
  onSuccess,
  defaultPreset,
  refetchProviders,
}) {
  const { handleSaveProvider, createState } = useProviderSave();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [accessToken, setAccessToken] = useState("");

  // Initialize state based on defaultPreset
  const [name, setName] = useState(defaultPreset?.name || "");
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

  // Update functions when defaultPreset changes
  const updateFromPreset = (preset) => {
    if (preset?.id) {
      const presetId = preset.id.toLowerCase();
      setName(preset.name);
      setFunctions({
        createLabelFunction: presetId,
        getRatesFunction: presetId,
        validateAddressFunction: presetId,
        trackShipmentFunction: presetId,
        cancelLabelFunction: presetId,
      });
    }
  };

  // Handle defaultPreset changes
  if (defaultPreset?.id && defaultPreset.name !== name) {
    updateFromPreset(defaultPreset);
  }

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

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="mb-1.5 block text-sm">Name</Label>
          <Input
            className="h-8 rounded-lg text-sm"
            placeholder="Provider name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-sm">Access Token</Label>
          <Input
            type="password"
            className="h-8 rounded-lg text-sm"
            placeholder="Enter access token"
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

      <div className="mt-6 pt-4 border-t -mx-4 px-4">
        <div className="flex justify-end">
          <Button
            size="sm"
            className="h-8 rounded-lg"
            onClick={() => {
              handleSaveProvider({
                name,
                accessToken,
                selectedAddress,
                isPreset: !!defaultPreset,
                presetId: defaultPreset?.id,
                onSuccess,
                refetchProviders,
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
    </div>
  );
}
