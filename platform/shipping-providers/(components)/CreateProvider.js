"use client";
import React, { useMemo, useState } from "react";
import { useCreateItem } from "@keystone/utils/useCreateItem";
import { useKeystone, useList } from "@keystone/keystoneProvider";
import { Button } from "@ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ui/dialog";
import { Fields } from "@keystone/themes/Tailwind/orion/components/Fields";
import { GraphQLErrorNotice } from "@keystone/themes/Tailwind/orion/components/GraphQLErrorNotice";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { Label } from "@ui/label";

// Available shipping provider adapters
export const shippingProviders = {
  easypost: "EasyPost",
  shippo: "soon",
  ups: "soon",
  fedex: "soon",
};

export function CreateProvider({ refetch, trigger }) {
  const [selectedProvider, setSelectedProvider] = useState(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const list = useList("ShippingProvider");
  const { create, props, state, error } = useCreateItem(list);
  const { createViewFieldModes } = useKeystone();

  const keysToUpdateCustom = [
    "name",
    "code",
    "createLabelFunction",
    "getRatesFunction",
    "validateAddressFunction",
    "trackShipmentFunction",
    "cancelLabelFunction",
    "credentials",
    "metadata",
  ];

  const keysToUpdateTemplate = ["name", "credentials", "metadata"];

  const handleProviderActivation = async () => {
    const item = await create();
    if (item) {
      refetch();
      clearFunctionFields();
      setIsDialogOpen(false);
    }
  };

  const handleTemplateSelection = (value) => {
    setSelectedProvider(value);

    if (value === "custom") {
      clearFunctionFields();
    } else {
      props.onChange((oldValues) => {
        const newValues = { ...oldValues };
        keysToUpdateCustom
          .filter((key) => !["credentials", "metadata"].includes(key))
          .forEach((key) => {
            newValues[key] = {
              ...oldValues[key],
              value: {
                ...oldValues[key].value,
                inner: {
                  ...oldValues[key].value.inner,
                  value:
                    key === "name"
                      ? shippingProviders[value]
                      : key === "code"
                      ? `sp_${value}`
                      : value,
                },
              },
            };
          });
        return newValues;
      });
    }
  };

  const clearFunctionFields = () => {
    const clearedFields = keysToUpdateCustom.reduce((acc, key) => {
      acc[key] = {
        ...props.value[key],
        value: {
          ...props.value[key].value,
          inner: {
            ...props.value[key].value.inner,
            value: "",
          },
        },
      };
      return acc;
    }, {});

    props.onChange((prev) => ({ ...prev, ...clearedFields }));
  };

  const handleDialogClose = () => {
    setSelectedProvider(null);
    clearFunctionFields();
    setIsDialogOpen(false);
  };

  const filteredProps = useMemo(() => {
    const fieldKeysToShow =
      selectedProvider === "custom" ? keysToUpdateCustom : keysToUpdateTemplate;

    return Object.fromEntries(
      Object.entries(props.value).filter(([key]) =>
        fieldKeysToShow.includes(key)
      )
    );
  }, [props.value, selectedProvider]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Shipping Provider</DialogTitle>
          <DialogDescription>
            {selectedProvider === "custom"
              ? "Create a custom shipping provider from scratch"
              : "Create a provider based on an existing template"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label className="text-base pb-2">Provider</Label>
          <Select
            onValueChange={handleTemplateSelection}
            value={selectedProvider}
          >
            <SelectTrigger className="w-full bg-muted/40 text-base">
              <SelectValue placeholder="Select a provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel className="-ml-6">Templates</SelectLabel>
                {Object.entries(shippingProviders).map(([key, value]) => (
                  <SelectItem
                    key={key}
                    value={key}
                    disabled={value === "soon"}
                  >
                    {value === "soon" ? `${key} (Coming Soon)` : value}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel className="-ml-6">Custom</SelectLabel>
                <SelectItem value="custom">Start from scratch...</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {selectedProvider && (
          <div className="bg-muted/20 p-4 border rounded-lg overflow-auto max-h-[50vh]">
            {error && (
              <GraphQLErrorNotice
                networkError={error?.networkError}
                errors={error?.graphQLErrors}
              />
            )}
            {createViewFieldModes.state === "error" && (
              <GraphQLErrorNotice
                networkError={
                  createViewFieldModes.error instanceof Error
                    ? createViewFieldModes.error
                    : undefined
                }
                errors={
                  createViewFieldModes.error instanceof Error
                    ? undefined
                    : createViewFieldModes.error
                }
              />
            )}
            {createViewFieldModes.state === "loading" && (
              <div label="Loading create form" />
            )}
            <Fields {...{ value: filteredProps, onChange: props.onChange }} />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleDialogClose}>
            Cancel
          </Button>
          <Button
            isLoading={state === "loading"}
            disabled={!selectedProvider}
            onClick={handleProviderActivation}
          >
            Create Provider
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 