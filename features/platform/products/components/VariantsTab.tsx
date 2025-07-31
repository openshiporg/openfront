"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  AlertCircle,
  Info,
  Check,
  X,
  MoreHorizontal,
  Settings,
  Layers,
  Save,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BadgeButton } from "@/components/ui/badge-button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useId } from "react";
import { VariantCard } from "./VariantCard";
import { VariantDriftCard } from "./VariantDriftCard";
import { AddOptionPopover } from "./AddOptionPopover";
import { OptionCard } from "./OptionCard";
import { toast } from "sonner";

// Import SWR and server actions
import { useProductData, useRegions } from "../hooks/useProductData";
import {
  createProductOption,
  updateProductOption,
  createProductOptionValue,
  updateProductOptionValue,
  deleteProductOptionValue,
  createProductVariant,
  deleteProductVariant,
  updateVariantPrice,
  updateMoneyAmount,
  saveVariantDriftChanges,
} from "../actions/variants";

// Debug utility that only logs in development
const debug = (label: string, data: any) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[DEBUG: ${label}]`, data);
  }
};

interface VariantsTab2Props {
  product: Record<string, any>;
}

export function VariantsTab({ product: initialProduct }: VariantsTab2Props) {
  // All state hooks first
  const [activeTab, setActiveTab] = useState("options");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isVariantsExpanded, setIsVariantsExpanded] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [variantsToCreate, setVariantsToCreate] = useState<any[]>([]);
  const [variantsToDelete, setVariantsToDelete] = useState<any[]>([]);
  const [unchangedVariants, setUnchangedVariants] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);

  // Use SWR hooks for data fetching
  const {
    product,
    loading: productLoading,
    error: productError,
    refetch,
  } = useProductData(initialProduct?.id);
  const {
    regions,
    loading: regionsLoading,
    error: regionsError,
  } = useRegions();

  // Use the fetched product data or fall back to initial product
  const currentProduct = product || initialProduct;

  // Ref for generateCombinations function
  const generateCombinationsRef = useRef<any>(null);

  const itemsPerPage = 5;

  // Initialize options from product data and transform for OptionCard
  useEffect(() => {
    if (currentProduct?.productOptions) {
      const transformedOptions = currentProduct.productOptions.map(
        (option: any) => ({
          ...option,
          values:
            option.productOptionValues?.map((ov: any) => ({
              id: ov.id,
              value: ov.value,
              label: ov.value,
            })) || [],
        })
      );
      setOptions(transformedOptions);
    }
  }, [currentProduct]);

  // Setup generateCombinations function
  useEffect(() => {
    generateCombinationsRef.current = (arrays: any[]): any[] => {
      if (arrays.length === 0) return [[]];
      const result: any[] = [];
      const restCombinations = generateCombinationsRef.current(arrays.slice(1));
      arrays[0].forEach((item: any) => {
        restCombinations.forEach((combination: any) => {
          result.push([item, ...combination]);
        });
      });
      return result;
    };
  }, []);

  // Memoized regions with locale mapping
  const regionsWithLocale = useMemo(() => {
    if (!regions) return [];
    return regions.map((region: any) => ({
      ...region,
      currencyCode: region.currency?.code,
      currencySymbol: region.currency?.symbolNative,
      locale:
        region.currency?.code === "USD"
          ? "en-US"
          : region.currency?.code === "EUR"
          ? "de-DE"
          : region.currency?.code === "GBP"
          ? "en-GB"
          : "en-US",
    }));
  }, [regions]);

  // Variant drift calculation functions
  const normalizeOptionValues = useCallback((optionValues: any[]) => {
    return [...optionValues].sort((a, b) => {
      const aKey = a.productOption?.title || a.option;
      const bKey = b.productOption?.title || b.option;
      return aKey.localeCompare(bKey);
    });
  }, []);

  const optionValuesMatch = useCallback(
    (values1: any[], values2: any[]) => {
      const normalized1 = normalizeOptionValues(values1);
      const normalized2 = normalizeOptionValues(values2);

      if (normalized1.length !== normalized2.length) return false;

      return normalized1.every((v1, index) => {
        const v2 = normalized2[index];
        const option1 = v1.productOption?.title || v1.option;
        const option2 = v2.productOption?.title || v2.option;
        const value1 = v1.value;
        const value2 = v2.value;

        return option1 === option2 && value1 === value2;
      });
    },
    [normalizeOptionValues]
  );

  const findSimilarVariant = useCallback(
    (optionValues: any[], existingVariants: any[]) => {
      const sortedNewValues = [...optionValues].sort((a, b) =>
        a.option.localeCompare(b.option)
      );

      let bestMatch = null;
      let maxMatchScore = -1;

      for (const variant of existingVariants) {
        if (!variant.productOptionValues) continue;

        const sortedExistingValues = [...variant.productOptionValues].sort(
          (a, b) => a.productOption.title.localeCompare(b.productOption.title)
        );

        let matchScore = 0;
        const minLength = Math.min(
          sortedNewValues.length,
          sortedExistingValues.length
        );

        for (let i = 0; i < minLength; i++) {
          if (
            sortedNewValues[i].option ===
              sortedExistingValues[i].productOption.title &&
            sortedNewValues[i].value === sortedExistingValues[i].value
          ) {
            matchScore++;
          }
        }

        if (matchScore > maxMatchScore) {
          maxMatchScore = matchScore;
          bestMatch = variant;
        }
      }

      return bestMatch;
    },
    []
  );

  const calculateVariantDrift = useCallback(
    (currentOptions: any[]) => {
      debug("Calculating variant drift", {
        currentOptions,
        existingVariants: currentProduct.productVariants || [],
      });

      const optionValues = currentOptions.map((option) =>
        option.values.map((v: any) => ({
          option: option.title,
          value: v.value,
          label: v.label,
          optionId: option.id,
          valueId: v.id,
        }))
      );

      const combinations = generateCombinationsRef.current(optionValues);
      debug("Generated combinations", combinations);

      const existingVariants = currentProduct.productVariants || [];
      const newVariants: any[] = [];
      const variantsToRemove: any[] = [];
      const unchangedVariants: any[] = [];

      // Check each combination to see if it exists
      combinations.forEach((combination: any[]) => {
        const matchingVariant = existingVariants.find((variant: any) =>
          optionValuesMatch(variant.productOptionValues || [], combination)
        );

        if (!matchingVariant) {
          // This combination doesn't exist, so it's a new variant
          const title = combination.map((ov) => ov.value).join(" / ");
          const similarVariant = findSimilarVariant(
            combination,
            existingVariants
          );

          const newVariant = {
            id: `new-${Date.now()}-${Math.random()}`,
            title,
            sku: similarVariant?.sku || "",
            barcode: similarVariant?.barcode || "",
            ean: similarVariant?.ean || "",
            upc: similarVariant?.upc || "",
            material: similarVariant?.material || "",
            productOptionValues: combination.map((ov) => ({
              id: ov.valueId,
              value: ov.value,
              productOption: {
                id: ov.optionId,
                title: ov.option,
              },
            })),
            prices: similarVariant?.prices || [],
          };

          newVariants.push(newVariant);
        } else {
          unchangedVariants.push(matchingVariant);
        }
      });

      // Find variants that should be removed (exist but no longer have valid combinations)
      existingVariants.forEach((variant: any) => {
        const hasValidCombination = combinations.some((combination: any[]) =>
          optionValuesMatch(variant.productOptionValues || [], combination)
        );

        if (!hasValidCombination) {
          variantsToRemove.push(variant);
        }
      });

      debug("Variant drift calculation results", {
        toCreate: newVariants,
        toDelete: variantsToRemove,
        unchanged: unchangedVariants,
      });

      setVariantsToCreate(newVariants);
      setVariantsToDelete(variantsToRemove);
      setUnchangedVariants(unchangedVariants);
    },
    [currentProduct.productVariants, optionValuesMatch, findSimilarVariant]
  );

  // Calculate variant drift whenever options change
  useEffect(() => {
    if (options.length > 0) {
      calculateVariantDrift(options);
    }
  }, [options, calculateVariantDrift]);

  // Handle adding new option
  const handleAddOption = async (newOption: { title: string }) => {
    if (!currentProduct?.id) return;

    try {
      const response = await createProductOption({
        title: newOption.title,
        productId: currentProduct.id,
      });

      if (response.success) {
        toast.success("Option added successfully");
        refetch(); // Refetch product data
      } else {
        toast.error(response.error || "Failed to add option");
      }
    } catch (error) {
      console.error("Error adding option:", error);
      toast.error("Failed to add option");
    }
  };

  // Handle updating option
  const handleOptionUpdate = async (updatedOption: any) => {
    try {
      // Update the option title if it changed
      if (updatedOption.title) {
        const titleResponse = await updateProductOption(updatedOption.id, {
          title: updatedOption.title,
        });

        if (!titleResponse.success) {
          toast.error(titleResponse.error || "Failed to update option title");
          return;
        }
      }

      // Handle option values changes
      if (updatedOption.values) {
        const currentOption = options.find(
          (opt) => opt.id === updatedOption.id
        );
        const currentValues = currentOption?.values || [];
        const newValues = updatedOption.values;

        // Find values to add
        const valuesToAdd = newValues.filter(
          (newVal: any) =>
            !currentValues.some(
              (currentVal: any) => currentVal.id === newVal.id
            )
        );

        // Find values to remove
        const valuesToRemove = currentValues.filter(
          (currentVal: any) =>
            !newValues.some((newVal: any) => newVal.id === currentVal.id)
        );

        // Find values to update
        const valuesToUpdate = newValues.filter(
          (newVal: any) =>
            newVal.id &&
            currentValues.some(
              (currentVal: any) =>
                currentVal.id === newVal.id && currentVal.value !== newVal.value
            )
        );

        // Create new values
        for (const valueToAdd of valuesToAdd) {
          if (!valueToAdd.id) {
            // Only create if it doesn't have an ID
            const createResponse = await createProductOptionValue({
              value: valueToAdd.value,
              productOptionId: updatedOption.id,
            });

            if (!createResponse.success) {
              toast.error(
                createResponse.error || "Failed to create option value"
              );
              return;
            }
          }
        }

        // Update existing values
        for (const valueToUpdate of valuesToUpdate) {
          const updateResponse = await updateProductOptionValue(
            valueToUpdate.id,
            {
              value: valueToUpdate.value,
            }
          );

          if (!updateResponse.success) {
            toast.error(
              updateResponse.error || "Failed to update option value"
            );
            return;
          }
        }

        // Delete removed values
        for (const valueToRemove of valuesToRemove) {
          if (valueToRemove.id) {
            const deleteResponse = await deleteProductOptionValue(
              valueToRemove.id
            );

            if (!deleteResponse.success) {
              toast.error(
                deleteResponse.error || "Failed to delete option value"
              );
              return;
            }
          }
        }
      }

      toast.success("Option updated successfully");
      refetch(); // Refetch product data
    } catch (error) {
      console.error("Error updating option:", error);
      toast.error("Failed to update option");
    }
  };

  // Handle adding price to variant
  const handleAddPrice = async (variantId: string, priceData: any) => {
    try {
      const response = await updateVariantPrice(variantId, priceData);

      if (response.success) {
        toast.success("Price added successfully");
        refetch(); // Refetch product data
      } else {
        toast.error(response.error || "Failed to add price");
      }
    } catch (error) {
      console.error("Error adding price:", error);
      toast.error("Failed to add price");
    }
  };

  // Handle option filter
  const handleOptionFilter = (option: string, value: string) => {
    const filterKey = `${option}:${value}`;
    setSelectedFilters((prev) =>
      prev.includes(filterKey)
        ? prev.filter((f) => f !== filterKey)
        : [...prev, filterKey]
    );
  };

  // Get filtered variants
  const getFilteredVariants = useCallback(
    (variants: any[]) => {
      if (!variants || selectedFilters.length === 0) return variants || [];

      return variants.filter((variant) => {
        return selectedFilters.every((filter) => {
          const [optionName, optionValue] = filter.split(":");
          return variant.productOptionValues?.some(
            (ov: any) =>
              ov.productOption.title === optionName && ov.value === optionValue
          );
        });
      });
    },
    [selectedFilters]
  );

  // Handle save changes for drift
  const handleSaveChanges = async (localVariants: any[]) => {
    if (!currentProduct?.id) {
      toast.error("Product ID not found");
      return;
    }

    setIsSaving(true);
    try {
      debug("Saving variant changes", {
        variantsToCreate: localVariants,
        variantsToDelete,
        productId: currentProduct.id,
      });

      const response = await saveVariantDriftChanges({
        productId: currentProduct.id,
        variantsToCreate: localVariants,
        variantsToDelete,
      });

      if (response.success) {
        toast.success(response.message || "Changes saved successfully");

        // Reset the drift state
        setVariantsToCreate([]);
        setVariantsToDelete([]);
        setUnchangedVariants([]);

        // Refresh the product data
        await refetch();
      } else {
        if (response.errors && response.errors.length > 0) {
          toast.error(`Some operations failed: ${response.errors.join(", ")}`);
          console.error("Variant operations errors:", response.errors);
        } else {
          toast.error(response.error || "Failed to save changes");
        }
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle remove from create
  const handleRemoveFromCreate = (variantId: string) => {
    setVariantsToCreate((prev) => prev.filter((v) => v.id !== variantId));
  };

  // Handle remove from delete
  const handleRemoveFromDelete = (variantId: string) => {
    setVariantsToDelete((prev) => prev.filter((v) => v.id !== variantId));
  };

  if (productLoading || regionsLoading) {
    return <div>Loading...</div>;
  }

  if (productError || regionsError) {
    return <div>Error loading data</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="h-auto mx-auto flex w-full bg-muted/40 border p-1 max-w-xl">
          <TabsTrigger
            value="options"
            className="group flex-1 flex-col p-3 text-xs data-[state=active]:shadow-none data-[state=active]:border"
          >
            <Badge
              className="mb-1.5 border rounded-full bg-background transition-opacity"
              color={"zinc"}
            >
              {options.length}
            </Badge>
            Options
          </TabsTrigger>
          <TabsTrigger
            value="variants"
            className="group flex-1 flex-col p-3 text-xs data-[state=active]:shadow-none data-[state=active]:border"
          >
            <Badge
              className="mb-1.5 border rounded-full bg-background transition-opacity"
              color={"zinc"}
            >
              {(currentProduct.productVariants || []).length}
            </Badge>
            Variants
          </TabsTrigger>
          <TabsTrigger
            value="drift"
            className="group flex-1 flex-col p-3 text-xs data-[state=active]:shadow-none data-[state=active]:border"
          >
            <div className="flex items-center gap-1 mb-1.5">
              <span className="inline-flex items-center gap-x-1 rounded-lg bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20 dark:bg-rose-500/30 dark:text-rose-300 dark:ring-rose-400/20">
                <ChevronDown className="-ml-0.5 size-3" aria-hidden={true} />
                {variantsToDelete.length}
              </span>
              <Badge
                className="border rounded-full bg-background transition-opacity"
                color={unchangedVariants.length > 0 ? "zinc" : "zinc"}
              >
                {unchangedVariants.length}
              </Badge>
              <span className="inline-flex items-center gap-x-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-600/30 dark:bg-emerald-400/20 dark:text-emerald-500 dark:ring-emerald-400/20">
                {variantsToCreate.length}
                <ChevronUp className="-ml-0.5 size-3" aria-hidden={true} />
              </span>
            </div>
            Changes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="options" className="mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Product Options</h2>
              <div className="text-sm text-muted-foreground">
                Add options like different sizes, colors, and materials
              </div>
            </div>
            <AddOptionPopover onAdd={handleAddOption} />
          </div>

          <div className="space-y-4 mt-6">
            {options.map((option) => (
              <OptionCard
                key={option.id}
                option={option}
                onUpdate={handleOptionUpdate}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="variants" className="mt-6">
          <div className="space-y-4">
            {/* Filter badges */}
            {selectedFilters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedFilters.map((filter) => {
                  const [option, value] = filter.split(":");
                  return (
                    <Badge
                      key={filter}
                      className="cursor-pointer"
                      onClick={() => handleOptionFilter(option, value)}
                    >
                      <span className="opacity-80">{option}:</span>
                      {value}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  );
                })}
              </div>
            )}

            {isVariantsExpanded && (
              <>
                {getFilteredVariants(currentProduct.productVariants || []).map(
                  (variant: any) => (
                    <VariantCard
                      key={variant.id}
                      variant={variant}
                      showActions={true}
                      regions={regionsWithLocale}
                      onAddPrice={handleAddPrice}
                      selectedFilters={selectedFilters}
                      onOptionFilter={handleOptionFilter}
                    />
                  )
                )}
                {selectedFilters.length > 0 &&
                  getFilteredVariants(currentProduct.productVariants || [])
                    .length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No variants match the selected filters
                    </div>
                  )}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="drift" className="mt-6">
          {variantsToCreate.length > 0 || variantsToDelete.length > 0 ? (
            <VariantDriftCard
              variantsToCreate={variantsToCreate}
              variantsToDelete={variantsToDelete}
              unchangedVariants={unchangedVariants}
              onRemoveFromCreate={handleRemoveFromCreate}
              onRemoveFromDelete={handleRemoveFromDelete}
              onSaveChanges={handleSaveChanges}
              regions={regionsWithLocale}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No pending changes
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}


export const VariantForm = ({ variant, onChange, onSave, onCancel }) => (
  <div className="flex flex-col">
    <div>
      <div className="p-4 border-b">
        <h3 className="font-medium text-sm mb-1">Edit Variant</h3>
        <p className="text-muted-foreground text-xs">
          Update variant properties
        </p>
      </div>
      <div className="space-y-2">
        <div className="grid gap-3 h-72 overflow-y-auto p-4">
          <div>
            <Label className="text-xs">SKU</Label>
            <Input
              value={variant.sku}
              onChange={(e) => onChange({ ...variant, sku: e.target.value })}
              placeholder="SKU-123"
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Barcode</Label>
            <Input
              value={variant.barcode}
              onChange={(e) =>
                onChange({ ...variant, barcode: e.target.value })
              }
              placeholder="123456789"
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">EAN</Label>
            <Input
              value={variant.ean}
              onChange={(e) => onChange({ ...variant, ean: e.target.value })}
              placeholder="1234567890123"
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">UPC</Label>
            <Input
              value={variant.upc}
              onChange={(e) => onChange({ ...variant, upc: e.target.value })}
              placeholder="123456789012"
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Stock</Label>
            <Input
              type="number"
              value={variant.inventoryQuantity}
              onChange={(e) =>
                onChange({ ...variant, inventoryQuantity: parseInt(e.target.value) })
              }
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">HS Code</Label>
            <Input
              value={variant.hsCode}
              onChange={(e) => onChange({ ...variant, hsCode: e.target.value })}
              placeholder="Enter HS code"
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Country of Origin</Label>
            <Input
              value={variant.originCountry}
              onChange={(e) =>
                onChange({ ...variant, originCountry: e.target.value })
              }
              placeholder="US"
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">MID Code</Label>
            <Input
              value={variant.midCode}
              onChange={(e) =>
                onChange({ ...variant, midCode: e.target.value })
              }
              placeholder="Enter MID code"
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Material</Label>
            <Input
              value={variant.material}
              onChange={(e) =>
                onChange({ ...variant, material: e.target.value })
              }
              placeholder="Cotton, Polyester, etc."
              className="mt-1 h-8 text-sm"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 p-4 border-t">
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={onSave}>
          Save
        </Button>
      </div>
    </div>
  </div>
);