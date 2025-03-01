import { useState, useRef, useEffect, useMemo } from "react";
import { useList } from "@keystone/keystoneProvider";
import { Button } from "@ui/button";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  AlertCircle,
  Info,
  Check,
  X,
  MoreHorizontal,
  Settings,
  Layers,
  Save,
} from "lucide-react";
import { useCreateItem } from "@keystone/utils/useCreateItem";
import { Input } from "@ui/input";
import { Badge, BadgeButton } from "@ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@ui/collapsible";
import { MultipleSelector } from "@ui/multi-select";
import { Switch } from "@ui/switch";
import { Alert, AlertDescription } from "@ui/alert";
import { Label } from "@ui/label";
import { Card, CardHeader, CardDescription, CardContent } from "@ui/card";
import { cn } from "@keystone/utils/cn";
import { Checkbox } from "@ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@ui/pagination";
import { OptionButton } from "./OptionButton";
import { OptionCard } from "./OptionCard";
import { AddOptionPopover } from "./AddOptionPopover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { useId } from "react";
import { VariantCard } from "./VariantCard";
import { gql, useMutation, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { useToast } from "@keystone/themes/Tailwind/orion/primitives/default/ui/use-toast";
import { VariantDriftCard } from "./VariantDriftCard";

// Debug utility that only logs in development
// This won't affect component lifecycle or performance in production
const debug = (label, data) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[DEBUG: ${label}]`, data);
  }
};

const statusColors = {
  draft: "bg-muted/40 text-muted-foreground border-muted-foreground/20",
  published:
    "bg-green-50 text-green-700 border-green-600/20 dark:bg-green-500/10",
  archived:
    "bg-yellow-50 text-yellow-700 border-yellow-600/20 dark:bg-yellow-500/10",
};

const NumberInput = ({
  value,
  onChange,
  label,
  unit = "",
  min = 0,
  className,
}) => (
  <div className="space-y-1">
    <Label className="text-xs">{label}</Label>
    <div className="relative inline-flex h-8 w-full items-center overflow-hidden whitespace-nowrap rounded-md border border-input text-sm shadow-sm">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        className={cn(
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          "grow bg-background px-2 py-1 text-left tabular-nums text-foreground focus:outline-none border-0 text-sm",
          className
        )}
      />
      {unit && (
        <span className="pr-2 text-muted-foreground text-sm">{unit}</span>
      )}
      <div className="flex flex-col -mt-px -mr-px">
        <Button
          size="icon"
          variant="ghost"
          className="[&_svg]:size-4 flex h-1/2 w-5 items-center justify-center border border-input bg-background text-muted-foreground/80 hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50 rounded-none"
          onClick={() => {
            const currentValue = parseFloat(value) || 0;
            onChange((currentValue + 1).toString());
          }}
        >
          <ChevronUp strokeWidth={2} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="[&_svg]:size-4 -mt-px flex h-1/2 w-5 items-center justify-center border border-input bg-background text-muted-foreground/80 hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50 rounded-none"
          onClick={() => {
            const currentValue = parseFloat(value) || 0;
            if (currentValue > min) {
              onChange((currentValue - 1).toString());
            }
          }}
        >
          <ChevronDown strokeWidth={2} />
        </Button>
      </div>
    </div>
  </div>
);

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
            <NumberInput
              label="Stock"
              value={variant.inventoryQuantity}
              onChange={(val) =>
                onChange({ ...variant, inventoryQuantity: parseInt(val) })
              }
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
          <div className="col-span-full flex items-center space-x-2">
            <Checkbox
              id="manage-inventory"
              checked={variant.manageInventory}
              onCheckedChange={(checked) =>
                onChange({ ...variant, manageInventory: checked })
              }
            />
            <Label htmlFor="manage-inventory" className="text-xs">
              Track quantity
            </Label>
          </div>
          <div className="col-span-full flex items-center space-x-2">
            <Checkbox
              id="allow-backorder"
              checked={variant.allowBackorder}
              onCheckedChange={(checked) =>
                onChange({ ...variant, allowBackorder: checked })
              }
            />
            <Label htmlFor="allow-backorder" className="text-xs">
              Continue selling when out of stock
            </Label>
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

const transitionProps = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.5,
};

const UPDATE_PRODUCT_OPTION = gql`
  mutation UpdateProductOption($id: ID!, $data: ProductOptionUpdateInput!) {
    updateProductOption(where: { id: $id }, data: $data) {
      id
      title
      productOptionValues {
        id
        value
      }
    }
  }
`;

const CREATE_PRODUCT_OPTION = gql`
  mutation CreateProductOption($data: ProductOptionCreateInput!) {
    createProductOption(data: $data) {
      id
      title
      productOptionValues {
        id
        value
      }
    }
  }
`;

const CREATE_PRODUCT_OPTION_VALUE = gql`
  mutation CreateProductOptionValue($data: ProductOptionValueCreateInput!) {
    createProductOptionValue(data: $data) {
      id
      value
      productOption {
        id
        title
      }
    }
  }
`;

const UPDATE_PRODUCT_OPTION_VALUE = gql`
  mutation UpdateProductOptionValue(
    $id: ID!
    $data: ProductOptionValueUpdateInput!
  ) {
    updateProductOptionValue(where: { id: $id }, data: $data) {
      id
      value
      productOption {
        id
        title
      }
    }
  }
`;

const DELETE_PRODUCT_OPTION_VALUE = gql`
  mutation DeleteProductOptionValue($id: ID!) {
    deleteProductOptionValue(where: { id: $id }) {
      id
    }
  }
`;

const GET_REGIONS = gql`
  query GetRegions {
    regions {
      id
      code
      name
      taxRate
      currency {
        code
        symbol
        symbolNative
        name
      }
    }
  }
`;

const ADD_VARIANT_PRICE = gql`
  mutation AddVariantPrice($id: ID!, $input: ProductVariantUpdateInput!) {
    updateProductVariant(where: { id: $id }, data: $input) {
      id
      prices {
        id
        amount
        compareAmount
        currency {
          code
          symbol
          name
          symbolNative
        }
        region {
          id
          code
          name
          taxRate
        }
      }
    }
  }
`;

// Add this new mutation for updating prices directly
const UPDATE_MONEY_AMOUNT = gql`
  mutation UpdateMoneyAmount($id: ID!, $data: MoneyAmountUpdateInput!) {
    updateMoneyAmount(where: { id: $id }, data: $data) {
      id
      amount
      compareAmount
      currency {
        code
      }
      region {
        id
        code
        name
      }
    }
  }
`;

const DELETE_PRODUCT_VARIANT = gql`
  mutation DeleteProductVariant($id: ID!) {
    deleteProductVariant(where: { id: $id }) {
      id
      title
    }
  }
`;

const CREATE_PRODUCT_VARIANT = gql`
  mutation CreateProductVariant($data: ProductVariantCreateInput!) {
    createProductVariant(data: $data) {
      id
      title
      sku
      barcode
      ean
      upc
      material
      productOptionValues {
        id
        value
        productOption {
          id
          title
        }
      }
      prices {
        id
        amount
        compareAmount
        region {
          id
          code
          name
          currency {
            code
            symbol
            symbolNative
          }
        }
      }
    }
  }
`;

const findSimilarVariant = (optionValues, existingVariants) => {
  // Sort option values by option title for consistent comparison
  const sortedNewValues = [...optionValues].sort((a, b) =>
    a.option.localeCompare(b.option)
  );

  let bestMatch = null;
  let maxMatchScore = -1;

  existingVariants.forEach((variant) => {
    // Sort existing variant's option values
    const sortedExistingValues = [...variant.productOptionValues].sort((a, b) =>
      a.productOption.title.localeCompare(b.productOption.title)
    );

    // Calculate match score based on matching values
    let matchScore = 0;
    let exactMatches = 0;

    sortedNewValues.forEach((newValue) => {
      const matchingValue = sortedExistingValues.find(
        (existingValue) => existingValue.productOption.title === newValue.option
      );

      if (matchingValue) {
        // Exact value match gets highest score
        if (matchingValue.value === newValue.value) {
          matchScore += 100;
          exactMatches++;
        }
      }
    });

    // Add bonus for having more exact matches
    matchScore += exactMatches * 50;

    // Update best match if this variant has a higher score
    if (matchScore > maxMatchScore) {
      maxMatchScore = matchScore;
      bestMatch = variant;
    }
  });

  return bestMatch;
};

export function VariantsTab({ product }) {
  const [activeTab, setActiveTab] = useState("options");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [isVariantsExpanded, setIsVariantsExpanded] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Add refetch query
  const { refetch } = useQuery(
    gql`
      query GetProduct($id: ID!) {
        product(where: { id: $id }) {
          id
          productVariants {
            id
            title
            sku
            barcode
            ean
            upc
            material
            productOptionValues {
              id
              value
              productOption {
                id
                title
              }
            }
            prices {
              id
              amount
              compareAmount
              region {
                id
                code
                name
                currency {
                  code
                  symbol
                  symbolNative
                }
              }
            }
          }
        }
      }
    `,
    {
      variables: { id: product.id },
      skip: true, // Only run when refetch is called
    }
  );

  // Add filter handling
  const handleOptionFilter = (option, value) => {
    const filter = `${option}:${value}`;
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const getFilteredVariants = (variants) => {
    if (!selectedFilters.length) return variants;

    return variants.filter((variant) =>
      selectedFilters.every((filter) => {
        const [option, value] = filter.split(":");
        return variant.productOptionValues.some(
          (ov) => ov.productOption.title === option && ov.value === value
        );
      })
    );
  };

  // Initialize options from product data
  const [options, setOptions] = useState(() =>
    product.productOptions.map((option) => ({
      id: option.id,
      title: option.title,
      values: option.productOptionValues.map((value) => ({
        value: value.value,
        label: value.value,
        id: value.id,
      })),
    }))
  );

  const [variantsToCreate, setVariantsToCreate] = useState([]);
  const [variantsToDelete, setVariantsToDelete] = useState([]);
  const [unchangedVariants, setUnchangedVariants] = useState(
    product.productVariants || []
  );

  const itemsPerPage = 5;
  const { toast } = useToast();

  // GraphQL mutations
  const [updateProductOption] = useMutation(UPDATE_PRODUCT_OPTION);
  const [createProductOption] = useMutation(CREATE_PRODUCT_OPTION);
  const [createProductOptionValue] = useMutation(CREATE_PRODUCT_OPTION_VALUE);
  const [updateProductOptionValue] = useMutation(UPDATE_PRODUCT_OPTION_VALUE);
  const [updateVariantPrice] = useMutation(ADD_VARIANT_PRICE);
  const [updateMoneyAmount] = useMutation(UPDATE_MONEY_AMOUNT);
  const [deleteProductOptionValue] = useMutation(DELETE_PRODUCT_OPTION_VALUE);
  const [createProductVariant] = useMutation(CREATE_PRODUCT_VARIANT);
  const [deleteProductVariant] = useMutation(DELETE_PRODUCT_VARIANT);

  // Add query for regions
  const { data: regionsData } = useQuery(GET_REGIONS);

  // Update regions definition to use GraphQL data
  const regions = useMemo(() => {
    if (!regionsData?.regions) return [];
    return regionsData.regions.map((region) => ({
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
  }, [regionsData]);

  // Calculate variant drift whenever options change or on mount
  useEffect(() => {
    calculateVariantDrift(options);
  }, [options, product.productVariants]);

  // Updated to be a separate function that can be called independently
  const calculateVariantDrift = (currentOptions) => {
    debug("Calculating variant drift", {
      currentOptions,
      existingVariants: product.productVariants,
    });

    // Generate all possible combinations from current options
    const optionValues = currentOptions.map((option) =>
      option.values.map((v) => ({
        option: option.title,
        value: v.value,
        label: v.label,
        optionId: option.id,
        valueId: v.id,
      }))
    );

    const combinations = generateCombinations(optionValues);
    debug("Generated combinations", combinations);

    // Identify variants to create (new combinations)
    const newVariants = combinations
      .map((combination) => {
        const optionValuePairs = combination.map((value) => ({
          option: value.option,
          value: value.value,
          label: value.label,
          optionId: value.optionId,
          valueId: value.valueId,
        }));

        // Check if this combination already exists
        const exists = product.productVariants.some((variant) => {
          const variantOptionValues = variant.productOptionValues.map((ov) => ({
            option: ov.productOption.title,
            value: ov.value,
            label: ov.value,
          }));
          return optionValuesMatch(variantOptionValues, optionValuePairs);
        });

        if (exists) return null;

        // Find similar variant to copy prices from
        const similarVariant = findSimilarVariant(
          optionValuePairs,
          product.productVariants
        );
        const copiedPrices =
          similarVariant?.prices?.map((price) => ({
            id: `new-price-${Date.now()}-${Math.random()}`,
            currency: {
              code: price.region.currency.code,
              symbol: price.region.currency.symbol,
              symbolNative: price.region.currency.symbolNative,
              name: price.region.currency.name,
            },
            amount: price.amount,
            compareAmount: price.compareAmount,
            region: price.region,
          })) || [];

        // Create new variant for new combinations
        return {
          id: `new-${Date.now()}-${Math.random()}`,
          title: optionValuePairs.map((ov) => ov.value).join(" / "),
          sku: "",
          barcode: "",
          ean: "",
          upc: "",
          inventoryQuantity: 100,
          manageInventory: false,
          allowBackorder: false,
          hsCode: "",
          originCountry: "",
          midCode: "",
          material: "",
          prices: copiedPrices,
          productOptionValues: optionValuePairs.map((ov) => ({
            productOption: {
              id: ov.optionId,
              title: ov.option,
            },
            value: ov.value,
            id: ov.valueId,
          })),
        };
      })
      .filter(Boolean);

    // Identify variants to delete (combinations that no longer exist)
    const variantsToRemove = product.productVariants.filter((variant) => {
      const variantOptionValues = variant.productOptionValues.map((ov) => ({
        option: ov.productOption.title,
        value: ov.value,
        label: ov.value,
      }));

      // Check if this variant's combination exists in new combinations
      return !combinations.some((combination) => {
        const optionValuePairs = combination.map((value) => ({
          option: value.option,
          value: value.value,
          label: value.label,
        }));
        return optionValuesMatch(variantOptionValues, optionValuePairs);
      });
    });

    // Identify unchanged variants
    const unchangedVariants = product.productVariants.filter((variant) => {
      return !variantsToRemove.includes(variant);
    });

    debug("Variant drift calculation results", {
      toCreate: newVariants,
      toDelete: variantsToRemove,
      unchanged: unchangedVariants,
    });

    // Update states
    setVariantsToCreate(newVariants);
    setVariantsToDelete(variantsToRemove);
    setUnchangedVariants(unchangedVariants);
    // setVariants([...unchangedVariants, ...newVariants]);

    // If there are changes, switch to the variant drift tab
    // if (newVariants.length > 0 || variantsToRemove.length > 0) {
    //   setActiveTab("drift");
    // }
  };

  // Helper functions remain the same...
  const normalizeOptionValues = (optionValues) => {
    return [...optionValues].sort((a, b) => {
      const aKey = a.productOption?.title || a.option;
      const bKey = b.productOption?.title || b.option;
      return aKey.localeCompare(bKey);
    });
  };

  const optionValuesMatch = (existing, candidate) => {
    if (!existing || !candidate) return false;
    const normalizedExisting = normalizeOptionValues(existing);
    const normalizedCandidate = normalizeOptionValues(candidate);
    if (normalizedExisting.length !== normalizedCandidate.length) return false;
    return normalizedExisting.every((existingOv, index) => {
      const candidateOv = normalizedCandidate[index];
      const existingOption =
        existingOv.productOption?.title || existingOv.option;
      const candidateOption =
        candidateOv.productOption?.title || candidateOv.option;
      return (
        existingOption === candidateOption &&
        existingOv.value === candidateOv.value
      );
    });
  };

  const generateCombinations = (arrays) => {
    if (arrays.length === 0) return [[]];
    const result = [];
    const restCombinations = generateCombinations(arrays.slice(1));
    arrays[0].forEach((item) => {
      restCombinations.forEach((combination) => {
        result.push([item, ...combination]);
      });
    });
    return result;
  };

  // Updated to handle immediate option creation
  const handleAddOption = async (newOption) => {
    try {
      // Create the option immediately
      const result = await createProductOption({
        variables: {
          data: {
            title: newOption.title,
            product: {
              connect: { id: product.id },
            },
          },
        },
      });

      if (result.data?.createProductOption) {
        const createdOption = result.data.createProductOption;

        // Update local state with the new option
        setOptions((prev) => [
          ...prev,
          {
            id: createdOption.id,
            title: createdOption.title,
            values: [],
          },
        ]);

        toast({
          title: "Option created successfully",
          variant: "success",
        });

        // Recalculate variants
        calculateVariantDrift([
          ...options,
          {
            id: createdOption.id,
            title: createdOption.title,
            values: [],
          },
        ]);
      }
    } catch (error) {
      console.error("Error creating option:", error);
      toast({
        title: "Error creating option",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Updated to handle immediate value creation and deletion
  const handleOptionUpdate = async (updatedOption) => {
    try {
      // Get current option values from state
      const currentOption = options.find((o) => o.id === updatedOption.id);
      const currentValues = currentOption?.values || [];

      // Identify values to create and delete
      const newValues = updatedOption.values.filter((v) => !v.id);
      const deletedValues = currentValues.filter(
        (cv) => !updatedOption.values.some((uv) => uv.id === cv.id)
      );

      // Delete removed values
      for (const value of deletedValues) {
        await deleteProductOptionValue({
          variables: {
            id: value.id,
          },
        });
      }

      // Create new values
      for (const value of newValues) {
        const result = await createProductOptionValue({
          variables: {
            data: {
              value: value.value,
              productOption: {
                connect: { id: updatedOption.id },
              },
            },
          },
        });

        if (result.data?.createProductOptionValue) {
          const createdValue = result.data.createProductOptionValue;
          value.id = createdValue.id;
        }
      }

      // Update local state immediately after deletions and additions
      const updatedValues = updatedOption.values
        .filter(
          (v) =>
            // Keep values that weren't deleted
            !deletedValues.some((dv) => dv.id === v.id) ||
            // And keep newly created values
            newValues.some((nv) => nv.value === v.value)
        )
        .map((v) => ({
          id: v.id,
          value: v.value,
          label: v.value,
        }));

      setOptions((prev) =>
        prev.map((opt) =>
          opt.id === updatedOption.id
            ? {
                ...opt,
                title: updatedOption.title,
                values: updatedValues,
              }
            : opt
        )
      );

      // Update the option title if changed
      if (
        updatedOption.title !==
        options.find((o) => o.id === updatedOption.id)?.title
      ) {
        await updateProductOption({
          variables: {
            id: updatedOption.id,
            data: {
              title: updatedOption.title,
            },
          },
        });
      }

      toast({
        title: "Option updated successfully",
        variant: "success",
      });

      // Recalculate variants with the updated values
      calculateVariantDrift(
        options.map((opt) =>
          opt.id === updatedOption.id
            ? {
                ...opt,
                title: updatedOption.title,
                values: updatedValues,
              }
            : opt
        )
      );
    } catch (error) {
      console.error("Error updating option:", error);
      toast({
        title: "Error updating option",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Handle removing variants from create/delete lists
  const handleRemoveFromCreate = (variant) => {
    setVariantsToCreate((prev) => prev.filter((v) => v.id !== variant.id));
  };

  const handleRemoveFromDelete = (variant) => {
    setVariantsToDelete((prev) => prev.filter((v) => v.id !== variant.id));
    setUnchangedVariants((prev) => [...prev, variant]);
  };

  // Updated to handle immediate price updates for pending variants
  const handleAddPrice = async (variant, priceData) => {
    try {
      debug("Adding/Updating price - Initial state", {
        variant,
        priceData,
        currentVariants: product.productVariants,
        variantsToCreate,
      });

      // For pending variants, just update the local state
      if (String(variant.id).startsWith("new-")) {
        debug("Updating price for pending variant:", variant.id);

        // Create the new price object with all required data
        const newPrice = {
          id: `new-price-${Date.now()}`,
          amount: priceData.amount,
          compareAmount: priceData.compareAmount,
          currency: {
            code: priceData.currencyCode,
            ...(regions.find((r) => r.currency.code === priceData.currencyCode)
              ?.currency || {}),
          },
          region: {
            code: priceData.regionCode,
            ...(regions.find((r) => r.code === priceData.regionCode) || {}),
          },
        };

        debug("New price object:", newPrice);

        // Update variantsToCreate state
        const updatedVariantsToCreate = variantsToCreate.map((v) => {
          if (v.id === variant.id) {
            const existingPriceIndex = (v.prices || []).findIndex(
              (p) => p.region?.code === priceData.regionCode
            );

            let updatedPrices;
            if (existingPriceIndex >= 0) {
              updatedPrices = [...(v.prices || [])];
              updatedPrices[existingPriceIndex] = newPrice;
            } else {
              updatedPrices = [...(v.prices || []), newPrice];
            }

            return { ...v, prices: updatedPrices };
          }
          return v;
        });

        debug("Updated variantsToCreate state:", updatedVariantsToCreate);
        setVariantsToCreate(updatedVariantsToCreate);

        // Log final state after updates
        debug("Final state after updates:", {
          updatedVariantToCreate: updatedVariantsToCreate.find(
            (v) => v.id === variant.id
          ),
        });

        toast({
          title: "Price updated for new variant",
          variant: "success",
        });
        return;
      }

      // For existing variants, handle API updates
      if (priceData.priceId) {
        // Update existing price
        const result = await updateMoneyAmount({
          variables: {
            id: priceData.priceId,
            data: {
              amount: priceData.amount,
              compareAmount: priceData.compareAmount,
            },
          },
        });

        if (result.data?.updateMoneyAmount) {
          const updatedPrice = result.data.updateMoneyAmount;
        }
      } else {
        // Create new price
        const result = await updateVariantPrice({
          variables: {
            id: variant.id,
            input: {
              prices: {
                create: [
                  {
                    amount: priceData.amount,
                    compareAmount: priceData.compareAmount,
                    currency: {
                      connect: { code: priceData.currencyCode.toLowerCase() },
                    },
                    ...(priceData.regionCode
                      ? {
                          region: {
                            connect: { code: priceData.regionCode },
                          },
                        }
                      : {}),
                  },
                ],
              },
            },
          },
        });
      }

      toast({
        title: priceData.priceId ? "Price updated" : "Price added",
        variant: "success",
      });
    } catch (error) {
      console.error("Error handling price:", error);
      toast({
        title: "Error updating price",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveChanges = async (localVariants) => {
    setIsSaving(true);
    const errors = [];

    try {
      // Create new variants
      for (const variant of localVariants) {
        try {
          const optionValueIds = variant.productOptionValues.map((ov) => ov.id);
          const prices =
            variant.prices?.map((price) => ({
              amount: price.amount,
              compareAmount: price.compareAmount,
              currency: {
                connect: { code: price.currency.code.toLowerCase() },
              },
              region: { connect: { code: price.region.code } },
            })) || [];

          await createProductVariant({
            variables: {
              data: {
                title: variant.title,
                sku: variant.sku || "",
                barcode: variant.barcode || "",
                ean: variant.ean || "",
                upc: variant.upc || "",
                material: variant.material || "",
                inventoryQuantity: variant.inventoryQuantity || 100,
                manageInventory: variant.manageInventory || false,
                allowBackorder: variant.allowBackorder || false,
                hsCode: variant.hsCode || "",
                originCountry: variant.originCountry || "",
                midCode: variant.midCode || "",
                product: { connect: { id: product.id } },
                productOptionValues: {
                  connect: optionValueIds.map((id) => ({ id })),
                },
                prices: { create: prices },
              },
            },
          });

          toast({
            title: "Variant Created",
            description: `Successfully created variant: ${variant.title}`,
          });
        } catch (error) {
          errors.push(
            `Failed to create variant ${variant.title}: ${error.message}`
          );
        }
      }

      // Delete variants marked for deletion
      for (const variant of variantsToDelete) {
        try {
          await deleteProductVariant({
            variables: {
              id: variant.id,
            },
          });

          toast({
            title: "Variant Deleted",
            description: `Successfully deleted variant: ${variant.title}`,
          });
        } catch (error) {
          errors.push(
            `Failed to delete variant ${variant.title}: ${error.message}`
          );
        }
      }

      if (errors.length > 0) {
        toast({
          variant: "destructive",
          title: "Some operations failed",
          description: "Check the console for details",
        });
        console.error("Variant operations errors:", errors);
      } else {
        toast({
          title: "Changes Saved",
          description: "All variant changes have been applied successfully",
        });

        // Reset the drift state
        setVariantsToCreate([]);
        setVariantsToDelete([]);

        // Refresh the product data
        await refetch();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save changes. Please try again.",
      });
      console.error("Save changes error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="h-auto mx-auto flex w-full bg-transparent max-w-xl">
          <TabsTrigger
            value="options"
            className="group data-[state=active]:bg-muted flex-1 flex-col p-3 text-xs data-[state=active]:shadow-none"
          >
            <Badge
              className="mb-1.5 border rounded-full transition-opacity group-data-[state=inactive]:opacity-50"
            >
              {options.length}
            </Badge>
            Options
          </TabsTrigger>
          <TabsTrigger
            value="variants"
            className="group data-[state=active]:bg-muted flex-1 flex-col p-3 text-xs data-[state=active]:shadow-none"
          >
            <Badge
              className="mb-1.5 border rounded-full transition-opacity group-data-[state=inactive]:opacity-50"
            >
              {product.productVariants.length}
            </Badge>
            Variants
          </TabsTrigger>
          <TabsTrigger
            value="drift"
            className="group data-[state=active]:bg-muted flex-1 flex-col p-3 text-xs data-[state=active]:shadow-none"
          >
            <div className="flex gap-1 mb-1.5">
              {variantsToCreate.length > 0 && (
                <Badge
                  color="emerald"
                  className="border rounded-full transition-opacity group-data-[state=inactive]:opacity-50"
                >
                  {variantsToCreate.length}
                </Badge>
              )}
              {variantsToDelete.length > 0 && (
                <Badge
                  color="rose"
                  className="border rounded-full transition-opacity group-data-[state=inactive]:opacity-50"
                >
                  {variantsToDelete.length}
                </Badge>
              )}
              {unchangedVariants.length > 0 && (
                <Badge
                  className="border rounded-full transition-opacity group-data-[state=inactive]:opacity-50"
                >
                  {unchangedVariants.length}
                </Badge>
              )}
            </div>
            Variant Drift
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
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setIsVariantsExpanded(!isVariantsExpanded)}
            >
              <h3 className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
                Current Variants
              </h3>
              <Badge className="py-0 text-[11px] border uppercase font-medium tracking-wide rounded-full flex items-center gap-1">
                {product.productVariants.length}
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform",
                    !isVariantsExpanded && "rotate-180"
                  )}
                />
              </Badge>
            </div>
            {selectedFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedFilters.map((filter) => {
                  const [option, value] = filter.split(":");
                  return (
                    // <Badge
                    //   key={filter}
                    //   color="white"
                    //   className="bg-accent flex items-center gap-1"
                    // >
                    //   <span className="opacity-80">{option}:</span>
                    //   {value}
                    //   <X
                    //     className="h-3 w-3 ml-1 cursor-pointer"
                    //     onClick={(e) => {
                    //       e.stopPropagation();
                    //       handleOptionFilter(option, value);
                    //     }}
                    //   />
                    // </Badge>
                    <Badge
                      key={filter}
                      color="zinc"
                      className={cn(
                        " flex items-center gap-1 uppercase rounded-md border text-[.65rem] py-[.0625rem] px-1.5 font-medium cursor-pointer hover:bg-accent/50"
                      )}
                    >
                      <span className="opacity-80">{option}:</span>
                      {value}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOptionFilter(option, value);
                        }}
                      />
                    </Badge>
                  );
                })}
              </div>
            )}
            {isVariantsExpanded && (
              <>
                {getFilteredVariants(product.productVariants).map((variant) => (
                  <VariantCard
                    key={variant.id}
                    variant={variant}
                    showActions={true}
                    regions={regions}
                    onAddPrice={handleAddPrice}
                    selectedFilters={selectedFilters}
                    onOptionFilter={handleOptionFilter}
                  />
                ))}
                {selectedFilters.length > 0 &&
                  getFilteredVariants(product.productVariants).length === 0 && (
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
              regions={regions}
            >
              <Button
                onClick={() => handleSaveChanges(variantsToCreate)}
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving Changes...
                  </div>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </VariantDriftCard>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center text-center py-6">
                  <Layers className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">
                    No Variant Changes
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    All variants are in sync with your current options. Add or
                    modify options to see variant changes here.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
