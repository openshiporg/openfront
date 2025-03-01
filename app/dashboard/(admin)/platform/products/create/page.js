"use client";
import { useKeystone, useList } from "@keystone/keystoneProvider";
import { useCreateItem } from "@keystone/utils/useCreateItem";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import { Fields } from "@keystone/themes/Tailwind/orion/components/Fields";
import { GraphQLErrorNotice } from "@keystone/themes/Tailwind/orion/components/GraphQLErrorNotice";
import { Button } from "@ui/button";
import { basePath } from "@keystone/index";
import { PageBreadcrumbs } from "@keystone/themes/Tailwind/orion/components/PageBreadcrumbs";
import { MediaTab } from "./components/MediaTab";
import { useToast } from "@ui/use-toast";

// Define tabs and field groups
const tabs = [
  "General",
  "Media",
  "Discounts & Taxes",
  "Organization",
];

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

export default function CreateProductPage({ params }) {
  const list = useList("Product");
  const variantList = useList("ProductVariant");
  const { createViewFieldModes } = useKeystone();
  const createItem = useCreateItem(list);
  const createVariant = useCreateItem(variantList);
  const router = useRouter();
  const adminPath = basePath;
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // Tab state
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverStyle, setHoverStyle] = useState({});
  const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" });
  const tabRefs = useRef([]);

  // Simple function to get a subset of fields based on field keys
  const getFieldsSubset = (fieldKeys) => {
    const fields = {};
    fieldKeys.forEach(key => {
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

  // Tab effects
  useEffect(() => {
    if (hoveredIndex !== null) {
      const hoveredElement = tabRefs.current[hoveredIndex];
      if (hoveredElement) {
        const { offsetLeft, offsetWidth } = hoveredElement;
        setHoverStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    }
  }, [hoveredIndex]);

  useEffect(() => {
    const activeElement = tabRefs.current[activeIndex];
    if (activeElement) {
      const { offsetLeft, offsetWidth } = activeElement;
      setActiveStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      });
    }
  }, [activeIndex]);

  // Extract only the necessary props from createItem.props for a given set of fields
  const getFieldProps = (fields) => {
    // Create a new value object with only the fields we need
    const filteredValue = {};
    Object.keys(fields).forEach(key => {
      if (createItem.props.value[key]) {
        filteredValue[key] = createItem.props.value[key];
      }
    });

    return {
      value: filteredValue,
      onChange: createItem.props.onChange,
      forceValidation: createItem.props.forceValidation,
      invalidFields: createItem.props.invalidFields || new Set(),
    };
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeIndex) {
      case 0: {
        const fields = generalFields;
        return (
          <Fields
            fields={fields}
            {...getFieldProps(fields)}
          />
        );
      }
      case 1: {
        const fields = mediaFields;
        return (
          <MediaTab
            fields={fields}
            {...getFieldProps(fields)}
          />
        );
      }
      case 2: {
        const fields = discountTaxFields;
        return (
          <Fields
            fields={fields}
            {...getFieldProps(fields)}
          />
        );
      }
      case 3: {
        const fields = organizationFields;
        return (
          <Fields
            fields={fields}
            {...getFieldProps(fields)}
          />
        );
      }
      default:
        return null;
    }
  };

  // Handle product creation and default variant
  const handleCreateProduct = async () => {
    // Validate all fields across all tabs
    const allFields = {
      ...generalFields,
      ...mediaFields,
      ...discountTaxFields,
      ...organizationFields
    };
    
    // Force validation on all fields - FIXED: pass a function to onChange
    createItem.props.onChange(oldValue => ({
      ...oldValue,
      forceValidation: true,
    }));
    
    // Check for any invalid fields and redirect to the tab containing them
    if (createItem.props.invalidFields && createItem.props.invalidFields.size > 0) {
      // Find which tab contains the invalid fields
      const invalidFieldNames = Array.from(createItem.props.invalidFields);
      
      if (invalidFieldNames.some(field => GENERAL_FIELDS.includes(field))) {
        setActiveIndex(0);
        toast({
          title: "Required fields missing",
          description: "Please fill out all required fields in the General tab",
          variant: "destructive",
        });
        return;
      } else if (invalidFieldNames.some(field => MEDIA_FIELDS.includes(field))) {
        setActiveIndex(1);
        toast({
          title: "Required fields missing",
          description: "Please fill out all required fields in the Media tab",
          variant: "destructive",
        });
        return;
      } else if (invalidFieldNames.some(field => DISCOUNT_TAX_FIELDS.includes(field))) {
        setActiveIndex(2);
        toast({
          title: "Required fields missing",
          description: "Please fill out all required fields in the Discounts & Taxes tab",
          variant: "destructive",
        });
        return;
      } else if (invalidFieldNames.some(field => ORGANIZATION_FIELDS.includes(field))) {
        setActiveIndex(3);
        toast({
          title: "Required fields missing",
          description: "Please fill out all required fields in the Organization tab",
          variant: "destructive",
        });
        return;
      }
    }
    
    try {
      setIsCreating(true);
      
      toast({
        title: "Creating product...",
        description: "Please wait while we create your product and default variant",
      });
      
      // Create the product
      const product = await createItem.create();
      
      if (product) {
        // Create a default variant for this product
        await createVariant.create({
          title: `${product.title} - Default Variant`,
          product: { connect: { id: product.id } },
          sku: `${product.handle || 'SKU'}-001`,
          // Set default inventory
          inventoryQuantity: 0,
          manageInventory: true,
        });
        
        toast({
          title: "Product created!",
          description: `Successfully created "${product.title}" with a default variant`,
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
          <Check className="opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
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
          <h1 className="text-lg font-semibold md:text-2xl">
            Create Product
          </h1>
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
              <div className="border-b px-1">
                <div className="relative">
                  {/* Hover Highlight */}
                  <div
                    className="absolute h-[28px] mt-1 transition-all duration-300 ease-out bg-muted/60 rounded-[6px] flex items-center"
                    style={{
                      ...hoverStyle,
                      opacity: hoveredIndex !== null ? 1 : 0,
                    }}
                  />

                  {/* Active Indicator */}
                  <div
                    className="absolute bottom-[-1px] h-[2px] bg-foreground transition-all duration-300 ease-out"
                    style={activeStyle}
                  />

                  {/* Tabs */}
                  <div className="relative flex space-x-[6px] items-center">
                    {tabs.map((tab, index) => (
                      <div
                        key={index}
                        ref={(el) => (tabRefs.current[index] = el)}
                        className={`px-3 py-2 cursor-pointer transition-colors duration-300 ${
                          index === activeIndex
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => setActiveIndex(index)}
                      >
                        <div className="text-sm font-medium leading-5 whitespace-nowrap flex items-center justify-center h-full">
                          {tab}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4">{renderTabContent()}</div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
