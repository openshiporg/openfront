"use client";

import { useList } from "@keystone/keystoneProvider";
import { useCreateItem } from "@keystone/utils/useCreateItem";

export const useProviderSave = () => {
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
    refetchProviders,
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
        // Refetch providers list after successful creation
        if (refetchProviders) {
          await refetchProviders();
        }
        onSuccess?.(result);
      }
    } catch (error) {
      console.error("Failed to create provider:", error);
    }
  };

  return { handleSaveProvider, createState };
}; 