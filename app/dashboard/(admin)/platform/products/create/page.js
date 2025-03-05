"use client";
import { useKeystone, useList } from "@keystone/keystoneProvider";
import { useCreateItem } from "@keystone/utils/useCreateItem";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Check, Loader2, Plus, X } from "lucide-react";
import { Fields } from "@keystone/themes/Tailwind/orion/components/Fields";
import { GraphQLErrorNotice } from "@keystone/themes/Tailwind/orion/components/GraphQLErrorNotice";
import { Button } from "@ui/button";
import { basePath } from "@keystone/index";
import { PageBreadcrumbs } from "@keystone/themes/Tailwind/orion/components/PageBreadcrumbs";
import { MediaTab } from "./components/MediaTab";
import { useToast } from "@ui/use-toast";
import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { Input } from "@ui/input";
import { Badge } from "@ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";

// Define tabs and field groups
const tabs = ["General", "Media", "Discounts & Taxes", "Organization"];

const GENERAL_FIELDS = [
  "title",
  "handle",
  "description",
  "subtitle",
  "isGiftcard",
];
const MEDIA_FIELDS = ["productImages"];
const DISCOUNT_TAX_FIELDS = [
  "discountable",
  "discountConditions",
  "discountRules",
  "taxRates",
];
const ORGANIZATION_FIELDS = [
  "status",
  "productCollections",
  "productCategories",
  "productTags",
];

// Helper functions for price formatting
const convertToStorageAmount = (displayAmount, currencyCode) => {
  const noDivisionCurrencies = ["jpy", "krw", "vnd"];
  const isNoDivision = noDivisionCurrencies.includes(
    currencyCode.toLowerCase()
  );

  const numericAmount =
    typeof displayAmount === "string"
      ? parseFloat(displayAmount.replace(/[^0-9.-]+/g, ""))
      : displayAmount;

  return isNoDivision
    ? Math.round(numericAmount)
    : Math.round(numericAmount * 100);
};

const formatDisplayAmount = (storageAmount, currencyCode) => {
  const noDivisionCurrencies = ["jpy", "krw", "vnd"];
  const isNoDivision = noDivisionCurrencies.includes(
    currencyCode.toLowerCase()
  );
  
  if (isNoDivision) {
    return storageAmount.toString();
  } else {
    // Format with 2 decimal places for proper display
    return (storageAmount / 100).toFixed(2);
  }
};

// Price form component for adding prices to regions
const PriceForm = ({ region, initialPrice, onSave, onCancel }) => {
  const [amount, setAmount] = useState(
    initialPrice?.amount
      ? formatDisplayAmount(initialPrice.amount, region.currency.code)
      : ""
  );
  const [compareAmount, setCompareAmount] = useState(
    initialPrice?.compareAmount
      ? formatDisplayAmount(initialPrice.compareAmount, region.currency.code)
      : ""
  );

  const handleSave = () => {
    if (!amount || isNaN(parseFloat(amount))) return;
    const storageAmount = convertToStorageAmount(amount, region.currency.code);
    const storageCompareAmount = compareAmount
      ? convertToStorageAmount(compareAmount, region.currency.code)
      : null;
    onSave({
      amount: storageAmount,
      compareAmount: storageCompareAmount,
      regionCode: region.code,
      currencyCode: region.currency.code,
    });
  };

  // Format the input value to ensure it has proper decimal places when user leaves the field
  const handleBlur = (value, setter) => {
    if (value && !isNaN(parseFloat(value))) {
      const noDivisionCurrencies = ["jpy", "krw", "vnd"];
      const isNoDivision = noDivisionCurrencies.includes(
        region.currency.code.toLowerCase()
      );
      
      if (!isNoDivision) {
        // Format with 2 decimal places when user leaves the field
        setter(parseFloat(value).toFixed(2));
      }
    }
  };

  return (
    <div className="flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-medium text-sm mb-1">
          {initialPrice ? "Update Price" : "Add Price"}
        </h3>
        <p className="text-muted-foreground text-xs">
          {region.name} • {region.currency.code.toUpperCase()}
          {region.taxRate ? ` • ${(region.taxRate * 100).toFixed(0)}% tax` : ""}
        </p>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <div className="text-xs mb-2">Price</div>
          <div className="relative">
            <Input
              type="text"
              value={amount}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^\d*\.?\d*$/.test(val)) {
                  setAmount(val);
                }
              }}
              onBlur={() => handleBlur(amount, setAmount)}
              className="peer ps-5 pe-10 h-8 text-sm"
              placeholder="0.00"
            />
            <span className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 text-xs">
              {region.currency.symbolNative}
            </span>
            <span className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-2 text-xs">
              {region.currency.code.toUpperCase()}
            </span>
          </div>
        </div>
        <div>
          <div className="text-xs mb-2">Compare at Price (Optional)</div>
          <div className="relative">
            <Input
              type="text"
              value={compareAmount}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^\d*\.?\d*$/.test(val)) {
                  setCompareAmount(val);
                }
              }}
              onBlur={() => handleBlur(compareAmount, setCompareAmount)}
              className="peer ps-5 pe-10 h-8 text-sm"
              placeholder="0.00"
            />
            <span className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 text-xs">
              {region.currency.symbolNative}
            </span>
            <span className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-2 text-xs">
              {region.currency.code.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
      <div className="p-4 border-t flex justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
};

// Region pricing component for the product creation page
const RegionPricing = ({ selectedRegions, setSelectedRegions }) => {
  const [openRegionId, setOpenRegionId] = useState(null);

  // Fetch available regions
  const { data, loading, error } = useQuery(gql`
    query GetRegions {
      regions {
        id
        name
        code
        taxRate
        currency {
          code
          symbol
          symbolNative
        }
      }
    }
  `);

  const regions = data?.regions || [];

  const handleAddPrice = (priceData) => {
    // Find if we already have a price for this region
    const existingIndex = selectedRegions.findIndex(
      (r) => r.regionCode === priceData.regionCode
    );

    if (existingIndex >= 0) {
      // Update existing price
      const updatedRegions = [...selectedRegions];
      updatedRegions[existingIndex] = priceData;
      setSelectedRegions(updatedRegions);
    } else {
      // Add new price
      setSelectedRegions([...selectedRegions, priceData]);
    }

    setOpenRegionId(null);
  };

  const handleRemovePrice = (regionCode) => {
    setSelectedRegions(
      selectedRegions.filter((r) => r.regionCode !== regionCode)
    );
  };

  const getPriceByRegionCode = (regionCode) => {
    return selectedRegions.find((p) => p.regionCode === regionCode);
  };

  if (loading) return <div className="mt-4">Loading regions...</div>;
  if (error)
    return (
      <div className="mt-4 text-red-500">
        Error loading regions: {error.message}
      </div>
    );

  return (
    <div className="mt-6">
      <div className="text-sm text-zinc-700 dark:text-zinc-50 font-medium mb-1.5">
        Prices
      </div>
      <div className="-mt-1 mb-3 whitespace-pre-wrap text-xs text-muted-foreground/80">
        Set prices for different regions and currencies
      </div>
      <div className="flex flex-wrap gap-4">
        {regions.map((region) => {
          const price = getPriceByRegionCode(region.code);

          return (
            <Popover
              key={region.id}
              open={openRegionId === region.code}
              onOpenChange={(open) =>
                setOpenRegionId(open ? region.code : null)
              }
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 cursor-pointer flex items-center gap-1.5 px-3 rounded-md text-sm hover:bg-accent"
                >
                  <span className="uppercase font-bold text-xs text-muted-foreground mr-0.5">
                    {region.currency.code}
                  </span>
                  {price ? (
                    <span>
                      <span className="opacity-80 mr-0.5">{region.currency.symbolNative}</span>
                      {formatDisplayAmount(price.amount, region.currency.code)}
                      {price.compareAmount && (
                        <span className="ml-1 line-through opacity-70">
                          {formatDisplayAmount(
                            price.compareAmount,
                            region.currency.code
                          )}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span>
                      {region.currency.symbolNative}{" "}
                      <span className="opacity-60 font-semibold">ADD</span>
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0">
                <PriceForm
                  region={region}
                  initialPrice={price}
                  onSave={handleAddPrice}
                  onCancel={() => setOpenRegionId(null)}
                />
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
    </div>
  );
};

export default function CreateProductPage({ params }) {
  const list = useList("Product");
  const variantList = useList("ProductVariant");
  const { createViewFieldModes } = useKeystone();
  const createItem = useCreateItem(list);
  const createVariant = useCreateItem(variantList);
  const router = useRouter();
  const { toast } = useToast();
  const adminPath = basePath;
  const [isCreating, setIsCreating] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState([]);

  // Tab state
  const [activeIndex, setActiveIndex] = useState(0);

  // Simple function to get a subset of fields based on field keys
  const getFieldsSubset = (fieldKeys) => {
    const fields = {};
    fieldKeys.forEach((key) => {
      if (list.fields[key]) {
        fields[key] = list.fields[key];
      }
    });
    return fields;
  };

  // Get field subsets for each tab
  const generalFields = getFieldsSubset(GENERAL_FIELDS);
  const mediaFields = getFieldsSubset(MEDIA_FIELDS);
  const discountTaxFields = getFieldsSubset(DISCOUNT_TAX_FIELDS);
  const organizationFields = getFieldsSubset(ORGANIZATION_FIELDS);

  // Combine all fields
  const allFields = {
    ...generalFields,
    ...mediaFields,
    ...discountTaxFields,
    ...organizationFields,
  };

  // Handle product creation and default variant
  const handleCreateProduct = async () => {
    try {
      setIsCreating(true);

      toast({
        title: "Creating product...",
        description:
          "Please wait while we create your product and default variant",
      });

      // Create the product
      const product = await createItem.create();

      if (product) {
        // Prepare prices data if regions were selected
        const pricesData = selectedRegions.length > 0 
          ? {
              prices: {
                create: selectedRegions.map(priceData => ({
                  amount: priceData.amount,
                  compareAmount: priceData.compareAmount || null,
                  currency: { connect: { code: priceData.currencyCode } },
                  region: { connect: { code: priceData.regionCode } }
                }))
              }
            } 
          : {};

        // Create a default variant for this product with prices inline
        const variant = await createVariant.createWithData({
          data: {
            title: `Default Variant`,
            product: { connect: { id: product.id } },
            sku: `${product.handle || "SKU"}-001`,
            // Set default inventory
            inventoryQuantity: 100,
            manageInventory: true,
            // Include prices directly in the variant creation
            ...pricesData
          },
        });

        console.log("Created variant with prices:", variant);

        toast({
          title: "Product created!",
          description: `Successfully created "${product.title || product.id}" with a default variant${selectedRegions.length > 0 ? ` and ${selectedRegions.length} prices` : ''}`,
          variant: "success",
        });

        // Redirect to the product page
        router.push(`${adminPath}/platform/products/${product.id}`);
      }
    } catch (error) {
      console.error("Error creating product with default variant:", error);
      toast({
        title: "Error creating product",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const actions = (
    <div className="flex items-center gap-2">
      {isCreating && (
        <div className="flex items-center text-xs text-muted-foreground mr-2">
          <Loader2 className="animate-spin h-3 w-3 mr-1" />
          Creating...
        </div>
      )}
      <Button
        className="relative pe-12"
        size="sm"
        isLoading={isCreating || createItem.state === "loading"}
        onClick={handleCreateProduct}
        disabled={isCreating || createItem.state === "loading"}
      >
        Create Product
        <span className="pointer-events-none absolute inset-y-0 end-0 flex w-9 items-center justify-center bg-primary-foreground/15">
          <Check
            className="opacity-60"
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
        </span>
      </Button>
    </div>
  );

  return (
    <>
      <PageBreadcrumbs
        items={[
          {
            type: "link",
            label: "Dashboard",
            href: "/dashboard",
          },
          {
            type: "model",
            label: list.label,
            href: `/dashboard/platform/products`,
            showModelSwitcher: false,
          },
          {
            type: "page",
            label: "Create",
          },
        ]}
        actions={actions}
      />

      <main className="w-full max-w-5xl p-4 md:p-6 flex flex-col gap-6">
        <div className="flex-col items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Create Product</h1>
          <p className="text-muted-foreground text-sm">
            Create and manage products in your catalog
          </p>
        </div>

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

        {createViewFieldModes.state === "loading" ? (
          <div label="Loading create form" />
        ) : (
          <div className="max-w-4xl">
            {createItem.error && (
              <GraphQLErrorNotice
                networkError={createItem.error?.networkError}
                errors={createItem.error?.graphQLErrors}
              />
            )}

            <div className="border rounded-lg shadow-sm bg-background">
              <div className="border-b overflow-x-auto no-scrollbar flex">
                <div className="flex min-w-max">
                  {tabs.map((tab, index) => (
                    <button
                      key={index}
                      className={`relative px-4 h-10 text-sm font-medium ${
                        index === activeIndex
                          ? "text-foreground before:absolute before:inset-x-0 before:bottom-0 before:h-0.5 before:bg-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() => setActiveIndex(index)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4">
                {/* General Tab Content */}
                <div className={activeIndex === 0 ? '' : 'hidden'}>
                  <Fields {...createItem.props} fields={generalFields} />
                  <RegionPricing
                    selectedRegions={selectedRegions}
                    setSelectedRegions={setSelectedRegions}
                  />
                </div>

                {/* Media Tab Content */}
                <div className={activeIndex === 1 ? '' : 'hidden'}>
                  <MediaTab {...createItem.props} fields={mediaFields} />
                </div>

                {/* Discounts & Taxes Tab Content */}
                <div className={activeIndex === 2 ? '' : 'hidden'}>
                  <Fields {...createItem.props} fields={discountTaxFields} />
                </div>

                {/* Organization Tab Content */}
                <div className={activeIndex === 3 ? '' : 'hidden'}>
                  <Fields {...createItem.props} fields={organizationFields} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
