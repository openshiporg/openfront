"use client";

import {
  Globe2,
  CreditCard,
  Package,
  ShoppingBag,
  Loader2,
  CircleDashed,
  ChevronDown,
  Building2,
  AlertCircle,
} from "lucide-react";
import { RiCheckboxCircleFill } from "@remixicon/react";
import { Card } from "@ui/card";
import { Checkbox } from "@ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@ui/accordion";
import { useState } from "react";
import { useKeystone } from "@keystone/keystoneProvider";
import seedData from "./seed.json";
import { Button } from "@ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { Badge } from "@ui/badge";
import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@ui/dropdown-menu";
import { gql, useMutation } from "@keystone-6/core/admin-ui/apollo";

const STORE_TEMPLATES = {
  full: {
    name: "Complete Setup",
    description: "Start with a fully configured store including multiple regions, payment methods, and a rich product catalog - recommended for most stores",
    requirements: {
      regions: 3,
      "payment-providers": 3,
      shipping: 3,
      categories: 4,
      collections: 3,
      products: 10,
    },
  },
  minimal: {
    name: "Basic Setup",
    description: "Start with just the essentials - one region, one payment method, and basic products. Perfect for testing or simple stores",
    requirements: {
      regions: 1,
      "payment-providers": 1,
      shipping: 1,
      categories: 1,
      collections: 1,
      products: 1,
    },
  },
};

const steps = [
  {
    id: "regions",
    title: "Regions & Countries",
    subtitle: "Set up your sales regions",
    icon: Globe2,
    description:
      "Configure regions with their currencies and select countries where you want to sell.",
    buttonText: "Configure Regions",
    status: "current",
    items: seedData.regions.map((region) => ({
      type: "region",
      data: {
        ...region,
        currency: {
          code: region.currencyCode,
          symbol: region.currencySymbol,
          name: region.currencyName,
        },
      },
      title: `${region.name} (${region.currencySymbol})`,
      description: `${region.currencyName} • ${region.taxRate * 100}% tax`,
      countries: region.countries.map((country) => ({
        type: "country",
        data: country,
        title: country.name,
        parentRegion: region.code,
      })),
    })),
  },
  {
    id: "payment-providers",
    title: "Payment Providers",
    subtitle: "Configure payment methods",
    icon: CreditCard,
    description: "Select the payment providers you want to use.",
    buttonText: "Configure Payments",
    status: "upcoming",
    items: seedData.paymentProviders.map((provider) => ({
      type: "paymentProvider",
      data: provider,
      title: provider.name,
      description: provider.code.includes("stripe") 
        ? "Payment provider - requires NEXT_PUBLIC_STRIPE_KEY and STRIPE_SECRET_KEY in .env"
        : provider.code.includes("paypal")
        ? "Payment provider - requires NEXT_PUBLIC_PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env"
        : `Payment provider - ${provider.code}`,
    })),
  },
  {
    id: "shipping",
    title: "Shipping Options",
    subtitle: "Set up shipping methods",
    icon: Package,
    description: "Configure shipping options for each region.",
    buttonText: "Configure Shipping",
    status: "upcoming",
    items: seedData.shipping_options.map((option) => ({
      type: "shippingOption",
      data: option,
      title: option.name,
      description: `${option.regionCode.toUpperCase()} - ${(option.amount / 100).toFixed(2)} ${option.regionCode === "eu" ? "EUR" : "USD"}`,
    })),
  },
  {
    id: "categories",
    title: "Product Categories",
    subtitle: "Create product categories",
    icon: ShoppingBag,
    description: "Set up categories to organize your products.",
    buttonText: "Configure Categories",
    status: "upcoming",
    items: seedData.categories.map((category) => ({
      type: "productCategory",
      data: category,
      title: category.name,
      description: `Handle: ${category.handle}`,
    })),
  },
  {
    id: "collections",
    title: "Collections",
    subtitle: "Create product collections",
    icon: ShoppingBag,
    description: 'Set up collections like "New Arrivals" and "Trending".',
    buttonText: "Configure Collections",
    status: "upcoming",
    items: seedData.collections.map((collection) => ({
      type: "productCollection",
      data: collection,
      title: collection.title,
      description: `Handle: ${collection.handle}`,
    })),
  },
  {
    id: "products",
    title: "Sample Products",
    subtitle: "Add initial products",
    icon: ShoppingBag,
    description: "Add sample products to your store.",
    buttonText: "Add Products",
    status: "upcoming",
    items: seedData.products.map((product) => ({
      type: "product",
      data: product,
      title: product.title,
      description: `${product.variants.length} variants, ${product.productOptions?.create?.length || 0} options`,
    })),
  },
];

const CheckboxCard = ({ title, checked, onCheckedChange, disabled }) => (
  <div className="flex items-center space-x-2 p-2">
    <Checkbox
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
    />
    <label className="text-sm cursor-pointer">{title}</label>
  </div>
);

const getDependentProducts = (categoryHandle, products) => {
  return products.filter((product) =>
    product.data.productCategories?.connect?.some(
      (cat) => cat.handle === categoryHandle
    )
  );
};

const getRegionShippingOptions = (regionCode, shippingOptions) => {
  return shippingOptions.filter(
    (option) =>
      option.data.regionCode === regionCode || option.data.regionCode === "all"
  );
};

const RegionCheckboxCard = ({
  region,
  checked,
  onCheckedChange,
  countryStates,
  onCountryChange,
  disabled,
}) => {
  const allCountriesSelected = region.countries.every(
    (country) => countryStates[country.data.iso2]
  );
  const someCountriesSelected = region.countries.some(
    (country) => countryStates[country.data.iso2]
  );
  const indeterminate = someCountriesSelected && !allCountriesSelected;

  return (
    <div className="p-2">
      <div className="flex space-x-2 mb-2">
        <Checkbox
          checked={checked}
          onCheckedChange={(isChecked) => {
            if (isChecked === true || isChecked === false) {
              onCheckedChange(isChecked);
              region.countries.forEach((country) => {
                onCountryChange(country, isChecked);
              });
            }
          }}
          disabled={disabled}
          indeterminate={indeterminate}
        />
        <div className="-mt-0.5">
          <label className="text-sm font-medium cursor-pointer">
            {region.title}
          </label>
          <p className="text-xs text-muted-foreground">
            {region.data.currency.symbol} - {region.data.currency.name}
          </p>
        </div>
      </div>
      <div className="flex flex-col space-y-2 ml-6">
        {region.countries.map((country) => (
          <div key={country.data.iso2} className="flex items-center space-x-2">
            <Checkbox
              checked={countryStates[country.data.iso2]}
              onCheckedChange={(isChecked) => {
                onCountryChange(country, isChecked);
                // If all countries are now selected/unselected, update region state
                const updatedStates = {
                  ...countryStates,
                  [country.data.iso2]: isChecked,
                };
                const allSelected = region.countries.every((c) =>
                  c.data.iso2 === country.data.iso2
                    ? isChecked
                    : updatedStates[c.data.iso2]
                );
                onCheckedChange(allSelected);
              }}
              disabled={disabled || !checked}
            />
            <label className="text-sm cursor-pointer">{country.title}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export const OnboardingCard = ({ data }) => {
  const {
    adminMeta: { lists },
  } = useKeystone();

  const [stepStatuses, setStepStatuses] = useState(
    steps.reduce(
      (acc, step) => ({
        ...acc,
        [step.id]: step.status,
      }),
      {}
    )
  );

  const [selectedItems, setSelectedItems] = useState(() => {
    const initial = {};
    steps.forEach((step) => {
      if (step.id === "regions") {
        initial[step.id] = {};
        initial["countries"] = {};
        step.items.forEach((region) => {
          initial[step.id][region.data.code] = true;
          region.countries.forEach((country) => {
            initial["countries"][country.data.iso2] = true;
          });
        });
      } else {
        initial[step.id] = step.items.reduce(
          (acc, item) => ({
            ...acc,
            [item.type +
            "-" +
            (item.data.code || item.data.handle || item.data.name)]: true,
          }),
          {}
        );
      }
    });
    return initial;
  });

  const [isCreating, setIsCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("full");
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);

  // Define mutations for each type
  const [createCurrency] = useMutation(gql`
    mutation CreateCurrency($data: CurrencyCreateInput!) {
      createCurrency(data: $data) {
        id
        code
      }
    }
  `);

  const [createPaymentProvider] = useMutation(gql`
    mutation CreatePaymentProvider($data: PaymentProviderCreateInput!) {
      createPaymentProvider(data: $data) {
        id
        code
      }
    }
  `);

  const [createCountry] = useMutation(gql`
    mutation CreateCountry($data: CountryCreateInput!) {
      createCountry(data: $data) {
        id
        iso2
      }
    }
  `);

  const [createRegion] = useMutation(gql`
    mutation CreateRegion($data: RegionCreateInput!) {
      createRegion(data: $data) {
        id
        code
      }
    }
  `);

  const [createShippingOption] = useMutation(gql`
    mutation CreateShippingOption($data: ShippingOptionCreateInput!) {
      createShippingOption(data: $data) {
        id
      }
    }
  `);

  const [createProductCategory] = useMutation(gql`
    mutation CreateProductCategory($data: ProductCategoryCreateInput!) {
      createProductCategory(data: $data) {
        id
        handle
      }
    }
  `);

  const [createProductCollection] = useMutation(gql`
    mutation CreateProductCollection($data: ProductCollectionCreateInput!) {
      createProductCollection(data: $data) {
        id
        handle
      }
    }
  `);

  const [createProduct] = useMutation(gql`
    mutation CreateProduct($data: ProductCreateInput!) {
      createProduct(data: $data) {
        id
        title
        productOptions {
          id
          title
          productOptionValues {
            id
            value
          }
        }
      }
    }
  `);

  const [createProductVariant] = useMutation(gql`
    mutation CreateProductVariant($data: ProductVariantCreateInput!) {
      createProductVariant(data: $data) {
        id
        title
      }
    }
  `);

  const [createFulfillmentProvider] = useMutation(gql`
    mutation CreateFulfillmentProvider($data: FulfillmentProviderCreateInput!) {
      createFulfillmentProvider(data: $data) {
        id
        code
      }
    }
  `);

  const [createProductImage] = useMutation(gql`
    mutation CreateProductImage($data: ProductImageCreateInput!) {
      createProductImage(data: $data) {
        id
        image {
          id
          filesize
          width
          height
          extension
          url
        }
      }
    }
  `);

  // Replace createItemHooks with direct mutation map
  const mutations = {
    currency: createCurrency,
    country: createCountry,
    region: createRegion,
    paymentProvider: createPaymentProvider,
    shippingOption: createShippingOption,
    productCategory: createProductCategory,
    productCollection: createProductCollection,
    product: createProduct,
    productVariant: createProductVariant,
    fulfillmentProvider: createFulfillmentProvider
  };

  // Add state to persist created items across attempts
  const [createdPaymentProviders] = useState(new Map());
  const [createdRegions] = useState(new Map());
  const [createdCategories] = useState(new Map());
  const [createdCollections] = useState(new Map());
  const [createdProducts] = useState(new Map());

  // Add function to read local file and create proper Upload object
  const createUploadFromLocalImage = async (handle) => {
    try {
      // Create a fetch request to get the local image
      const response = await fetch(`/storefront/lib/seed/images/${handle}.jpeg`);
      const blob = await response.blob();
      
      // Create a File object from the blob with proper metadata
      const file = new File([blob], `${handle}.jpeg`, { type: 'image/jpeg' });
      
      // Return the file in the format expected by Keystone's image field
      return {
        kind: "upload",
        data: {
          file,
          validity: { valid: true }
        }
      };
    } catch (error) {
      console.error(`Failed to create upload for ${handle}:`, error);
      return null;
    }
  };

  const handleCreateAll = async () => {
    setIsCreating(true);
    console.log('Starting creation process...');

    let hasError = false;

    try {
      // Reset all step statuses to initial state
      setStepStatuses(prev => {
        const newStatuses = {};
        Object.keys(prev).forEach(key => {
          if (prev[key] !== "complete") {
            newStatuses[key] = "upcoming";
          } else {
            newStatuses[key] = prev[key];
          }
        });
        return newStatuses;
      });

      // Payment Providers
      if (stepStatuses["payment-providers"] !== "complete") {
        setCurrentStep("payment-providers");
        setStepStatuses(prev => ({ ...prev, "payment-providers": "loading" }));
        
        try {
          console.log('Starting payment providers step with selected items:', selectedItems["payment-providers"]);
          
          const selectedPaymentProviderKeys = Object.entries(selectedItems["payment-providers"])
            .filter(([_, selected]) => selected)
            .map(([key]) => key);
          
          console.log('Selected payment provider keys:', selectedPaymentProviderKeys);
          
          const paymentProvidersStep = steps.find(s => s.id === "payment-providers");
          console.log('Payment providers step data:', paymentProvidersStep);
          
          const paymentProvidersToCreate = paymentProvidersStep.items.filter((item) => {
              const itemKey = `paymentProvider-${item.data.code}`;
              if (createdPaymentProviders.has(item.data.code)) {
                console.log(`Payment provider ${item.data.code} already exists in Map:`, createdPaymentProviders.get(item.data.code));
                return false;
              }
              const shouldCreate = selectedPaymentProviderKeys.includes(itemKey);
              console.log(`Payment provider ${item.data.code}:`, {
                itemKey,
                shouldCreate,
                data: item.data
              });
              return shouldCreate;
            });

          console.log('Payment providers to create:', paymentProvidersToCreate.map(p => p.data.code));

          for (const item of paymentProvidersToCreate) {
            try {
              console.log(`Attempting to create payment provider ${item.data.code} with data:`, {
                code: item.data.code,
                name: item.data.name,
                isInstalled: item.data.isInstalled,
                functions: {
                  create: item.data.code.split("_")[2],
                  capture: item.data.code.split("_")[2],
                  refund: item.data.code.split("_")[2],
                  status: item.data.code.split("_")[2],
                  link: item.data.code.split("_")[2],
                }
              });

              const mutationResult = await mutations.paymentProvider({
                variables: {
                  data: {
                    code: item.data.code,
                    name: item.data.name,
                    isInstalled: item.data.isInstalled,
                    createPaymentFunction: item.data.createPaymentFunction,
                    capturePaymentFunction: item.data.capturePaymentFunction,
                    refundPaymentFunction: item.data.refundPaymentFunction,
                    getPaymentStatusFunction: item.data.getPaymentStatusFunction,
                    generatePaymentLinkFunction: item.data.generatePaymentLinkFunction,
                    handleWebhookFunction: item.data.handleWebhookFunction,
                  },
                },
              });

              console.log(`Mutation result for ${item.data.code}:`, {
                fullResult: mutationResult,
                data: mutationResult.data,
                provider: mutationResult.data?.createPaymentProvider
              });

              if (!mutationResult.data?.createPaymentProvider) {
                console.error(`No provider data returned for ${item.data.code}:`, mutationResult);
                throw new Error(`Failed to create payment provider ${item.data.code} - no data returned`);
              }

              console.log(`Successfully created payment provider ${item.data.code}:`, mutationResult.data.createPaymentProvider);
              createdPaymentProviders.set(item.data.code, mutationResult.data.createPaymentProvider);
              console.log('Updated createdPaymentProviders Map:', Array.from(createdPaymentProviders.entries()));

            } catch (error) {
              console.error(`Failed to create payment provider ${item.data.code}:`, {
                error,
                errorMessage: error.message,
                errorStack: error.stack,
                graphQLErrors: error.graphQLErrors,
                networkError: error.networkError,
                extraInfo: error.extraInfo
              });
              setStepStatuses(prev => ({ ...prev, "payment-providers": "error" }));
              hasError = true;
              throw error;
            }
          }

          if (!hasError) {
            console.log('Payment providers step completed successfully. Created providers:', Array.from(createdPaymentProviders.entries()));
            setStepStatuses(prev => ({ ...prev, "payment-providers": "complete" }));
          }
        } catch (error) {
          console.error(`Failed in payment providers step:`, {
            error,
            errorMessage: error.message,
            errorStack: error.stack,
            graphQLErrors: error.graphQLErrors,
            networkError: error.networkError,
            extraInfo: error.extraInfo
          });
          setStepStatuses(prev => ({ ...prev, "payment-providers": "error" }));
          hasError = true;
          throw error;
        }
      }

      // Regions
      if (stepStatuses["regions"] !== "complete") {
        setCurrentStep("regions");
        setStepStatuses(prev => ({ ...prev, "regions": "loading" }));
        
        try {
          const selectedRegions = steps
            .find(s => s.id === "regions")
            .items.filter((region) => {
              // Skip if already created
              if (createdRegions.has(region.data.code)) {
                console.log(`Region ${region.data.code} already exists, skipping`);
                return false;
              }
              const isSelected = selectedItems.regions[region.data.code] === true;
              console.log(`Region ${region.data.code} selection status:`, isSelected);
              return isSelected;
            });

          // Create currencies first
          const currencyMap = new Map();
          for (const region of selectedRegions) {
            try {
              console.log(`Creating currency for region ${region.data.code}`);
              const currency = await mutations.currency({
                variables: {
                  data: {
                    code: region.data.currencyCode,
                    symbol: region.data.currencySymbol,
                    symbolNative: region.data.currencySymbol,
                    name: region.data.currencyName,
                  },
                },
              });
              currencyMap.set(region.data.currencyCode, currency.createCurrency);
            } catch (error) {
              console.error(`Failed to create currency for region ${region.data.code}:`, error);
              setStepStatuses(prev => ({ ...prev, "regions": "error" }));
              hasError = true;
              throw error;
            }
          }

          // Create countries
          const countryMap = new Map();
          for (const region of selectedRegions) {
            const selectedCountries = region.countries.filter(
              (country) => selectedItems.countries[country.data.iso2] === true
            );

            for (const country of selectedCountries) {
              try {
                console.log(`Creating country:`, country.data);
                const countryCreated = await mutations.country({
                  variables: {
                    data: {
                      ...country.data,
                      name: country.title,
                    },
                  },
                });
                countryMap.set(country.data.iso2, countryCreated.createCountry);
              } catch (error) {
                console.error(`Failed to create country ${country.data.iso2}:`, error);
                setStepStatuses(prev => ({ ...prev, "regions": "error" }));
                hasError = true;
                throw error;
              }
            }
          }

          // Create regions with verified connections
          for (const region of selectedRegions) {
            try {
              const verifiedPaymentProviders = region.data.paymentProviders.connect
                .filter(provider => {
                  const isSelected = selectedItems["payment-providers"][`paymentProvider-${provider.code}`] === true;
                  const wasCreated = createdPaymentProviders.has(provider.code);
                  return isSelected && wasCreated;
                });

              const verifiedCountries = region.countries
                .filter(country => {
                  const isSelected = selectedItems.countries[country.data.iso2] === true;
                  const wasCreated = countryMap.has(country.data.iso2);
                  return isSelected && wasCreated;
                });

              const regionCreated = await mutations.region({
                variables: {
                  data: {
                    code: region.data.code,
                    name: region.data.name,
                    currency: { connect: { code: region.data.currencyCode } },
                    taxRate: region.data.taxRate,
                    paymentProviders: {
                      connect: verifiedPaymentProviders.map(p => ({ code: p.code })),
                    },
                    countries: {
                      connect: verifiedCountries.map(country => ({
                        iso2: country.data.iso2,
                      })),
                    },
                  },
                },
              });
              createdRegions.set(region.data.code, regionCreated.createRegion);
            } catch (error) {
              console.error(`Failed to create region ${region.data.code}:`, error);
              setStepStatuses(prev => ({ ...prev, "regions": "error" }));
              hasError = true;
              throw error;
            }
          }

          setStepStatuses(prev => ({ ...prev, "regions": "complete" }));
        } catch (error) {
          console.error(`Failed in regions step:`, error);
          setStepStatuses(prev => ({ ...prev, "regions": "error" }));
          hasError = true;
          throw error;
        }
      }

      // Shipping Options
      if (stepStatuses["shipping"] !== "complete") {
        setCurrentStep("shipping");
        setStepStatuses(prev => ({ ...prev, "shipping": "loading" }));
        
        try {
          const selectedShippingKeys = Object.entries(selectedItems.shipping)
            .filter(([_, selected]) => selected)
            .map(([key]) => key);

          const shippingOptionsToCreate = steps
            .find(s => s.id === "shipping")
            .items.filter((item) => selectedShippingKeys.includes(item.type + "-" + item.data.name));

          console.log('Creating shipping options:', {
            selectedKeys: selectedShippingKeys,
            toCreate: shippingOptionsToCreate,
            availableRegions: Array.from(createdRegions.keys())
          });

          // Get all selected regions
          const selectedRegionCodes = Array.from(createdRegions.keys());
          console.log('Selected region codes for shipping options:', selectedRegionCodes);

          for (const item of shippingOptionsToCreate) {
            // For each shipping option, create it for all selected regions
            for (const regionCode of selectedRegionCodes) {
              try {
                console.log(`Creating shipping option "${item.data.name}" for region ${regionCode}:`, {
                  name: item.data.name,
                  priceType: item.data.priceType,
                  amount: item.data.amount,
                  regionCode
                });

                await mutations.shippingOption({
                  variables: {
                    data: {
                      name: item.data.name,
                      region: { connect: { code: regionCode } },
                      priceType: item.data.priceType,
                      amount: item.data.amount,
                      data: item.data.data || {},
                      isReturn: item.data.isReturn || false,
                    },
                  },
                });
              } catch (error) {
                console.error(`Failed to create shipping option "${item.data.name}" for region ${regionCode}:`, error);
                setStepStatuses(prev => ({ ...prev, "shipping": "error" }));
                hasError = true;
                throw error;
              }
            }
          }

          setStepStatuses(prev => ({ ...prev, "shipping": "complete" }));
        } catch (error) {
          console.error(`Failed in shipping step:`, error);
          setStepStatuses(prev => ({ ...prev, "shipping": "error" }));
          hasError = true;
          throw error;
        }
      }

      // Categories
      if (stepStatuses["categories"] !== "complete") {
        setCurrentStep("categories");
        setStepStatuses(prev => ({ ...prev, "categories": "loading" }));
        
        try {
          const selectedCategoryKeys = Object.entries(selectedItems.categories)
            .filter(([_, selected]) => selected)
            .map(([key]) => key);

          const categoriesToCreate = steps
            .find(s => s.id === "categories")
            .items.filter((item) => {
              // Skip if already created
              if (createdCategories.has(item.data.handle)) {
                console.log(`Category ${item.data.handle} already exists, skipping`);
                return false;
              }
              return selectedCategoryKeys.includes(`productCategory-${item.data.handle}`);
            });

          for (const item of categoriesToCreate) {
            try {
              console.log(`Creating category:`, item.data);
              const created = await mutations.productCategory({
                variables: {
                  data: {
                    title: item.data.name,
                    handle: item.data.handle,
                  },
                },
              });
              createdCategories.set(item.data.handle, created.createProductCategory);
            } catch (error) {
              console.error(`Failed to create category ${item.data.handle}:`, error);
              setStepStatuses(prev => ({ ...prev, "categories": "error" }));
              hasError = true;
              throw error;
            }
          }

          setStepStatuses(prev => ({ ...prev, "categories": "complete" }));
        } catch (error) {
          console.error(`Failed in categories step:`, error);
          setStepStatuses(prev => ({ ...prev, "categories": "error" }));
          hasError = true;
          throw error;
        }
      }

      // Collections
      if (stepStatuses["collections"] !== "complete") {
        setCurrentStep("collections");
        setStepStatuses(prev => ({ ...prev, "collections": "loading" }));
        
        try {
          const selectedCollectionKeys = Object.entries(selectedItems.collections)
            .filter(([_, selected]) => selected)
            .map(([key]) => key);

          const collectionsToCreate = steps
            .find(s => s.id === "collections")
            .items.filter((item) => {
              // Skip if already created
              if (createdCollections.has(item.data.handle)) {
                console.log(`Collection ${item.data.handle} already exists, skipping`);
                return false;
              }
              return selectedCollectionKeys.includes(`productCollection-${item.data.handle}`);
            });

          for (const item of collectionsToCreate) {
            try {
              console.log(`Creating collection:`, item.data);
              const created = await mutations.productCollection({
                variables: {
                  data: {
                    title: item.data.title,
                    handle: item.data.handle,
                  },
                },
              });
              createdCollections.set(item.data.handle, created.createProductCollection);
            } catch (error) {
              console.error(`Failed to create collection ${item.data.handle}:`, error);
              setStepStatuses(prev => ({ ...prev, "collections": "error" }));
              hasError = true;
              throw error;
            }
          }

          setStepStatuses(prev => ({ ...prev, "collections": "complete" }));
        } catch (error) {
          console.error(`Failed in collections step:`, error);
          setStepStatuses(prev => ({ ...prev, "collections": "error" }));
          hasError = true;
          throw error;
        }
      }

      // Products
      if (stepStatuses["products"] !== "complete") {
        setCurrentStep("products");
        setStepStatuses(prev => ({ ...prev, "products": "loading" }));
        
        try {
          const selectedProductKeys = Object.entries(selectedItems.products)
            .filter(([_, selected]) => selected)
            .map(([key]) => key);

          const productsToCreate = steps
            .find(s => s.id === "products")
            .items.filter((item) => {
              // Skip if already created
              if (createdProducts.has(item.data.handle)) {
                console.log(`Product ${item.data.handle} already exists, skipping`);
                return false;
              }
              return selectedProductKeys.includes(`product-${item.data.handle}`);
            });

          for (const item of productsToCreate) {
            try {
              const verifiedCategories = item.data.productCategories.connect
                .filter(cat => createdCategories.has(cat.handle))
                .map(cat => ({ handle: cat.handle }));

              const verifiedCollections = item.data.productCollections?.connect
                ?.filter(col => createdCollections.has(col.handle))
                .map(col => ({ handle: col.handle })) || [];

              if (verifiedCategories.length === 0) {
                throw new Error(`No valid categories found for product ${item.data.handle}`);
              }

              console.log('Creating product with data:', {
                title: item.data.title,
                options: item.data.productOptions,
                variants: item.data.variants
              });

              const { data: response } = await mutations.product({
                variables: {
                  data: {
                    title: item.data.title,
                    subtitle: item.data.subtitle || "",
                    description: typeof item.data.description === "string" 
                      ? [{ type: "paragraph", children: [{ text: item.data.description }] }]
                      : Array.isArray(item.data.description)
                        ? item.data.description
                        : [],
                    handle: item.data.handle,
                    isGiftcard: item.data.isGiftcard || false,
                    status: item.data.status || 'published',
                    productCategories: {
                      connect: verifiedCategories
                    },
                    productCollections: {
                      connect: verifiedCollections
                    },
                    productOptions: {
                      create: item.data.productOptions.create.map(option => ({
                        title: option.title,
                        productOptionValues: {
                          create: option.productOptionValues.create
                        }
                      }))
                    },
                    productImages: {
                      create: [{
                        imagePath: `/images/${item.data.handle}.jpeg`,
                        altText: item.data.title
                      }]
                    }
                  },
                },
              });

              if (!response?.createProduct) {
                throw new Error(`Failed to create product ${item.data.title}`);
              }

              const product = response.createProduct;
              console.log('Product creation response:', product);

              // Create variants
              console.log(`Creating variants for product ${item.data.title}`);
              const allOptionValues = product.productOptions.reduce(
                (acc, option) => {
                  return acc.concat(option.productOptionValues);
                },
                []
              );

              for (const variant of item.data.variants) {
                try {
                  console.log('Creating variant with options:', variant.options);
                  
                  const optionValues = variant.options.map((option) => option.value);
                  const matchingIds = allOptionValues
                    .filter((item) => optionValues.includes(item.value))
                    .map((item) => ({ id: item.id }));

                  console.log('Connecting variant to option values:', matchingIds);

                  const verifiedPrices = variant.prices
                    .filter(price => createdRegions.has(price.regionCode))
                    .map(price => ({
                      amount: price.amount,
                      currency: { connect: { code: price.currencyCode } },
                      region: { connect: { code: price.regionCode } }
                    }));

                  if (verifiedPrices.length === 0) {
                    throw new Error(`No valid prices found for variant ${variant.title}`);
                  }

                  const { data: variantResponse } = await mutations.productVariant({
                    variables: {
                      data: {
                        title: variant.title,
                        inventoryQuantity: variant.inventoryQuantity,
                        manageInventory: variant.manageInventory,
                        product: { connect: { id: product.id } },
                        productOptionValues: {
                          connect: matchingIds
                        },
                        prices: {
                          create: verifiedPrices
                        }
                      }
                    }
                  });

                  console.log(`Created variant:`, variantResponse?.createProductVariant);
                } catch (error) {
                  console.error(`Failed to create variant:`, {
                    error,
                    variant,
                    product
                  });
                  throw error;
                }
              }

              createdProducts.set(item.data.handle, product);
            } catch (error) {
              console.error(`Failed to create product:`, error);
              throw error;
            }
          }

          setStepStatuses(prev => ({ ...prev, "products": "complete" }));
        } catch (error) {
          console.error(`Failed in products step:`, error);
          setStepStatuses(prev => ({ ...prev, "products": "error" }));
          hasError = true;
          throw error;
        }
      }

    } catch (error) {
      console.error(`Error in step ${currentStep}:`, error);
      setStepStatuses(prev => ({ ...prev, [currentStep]: "error" }));
      hasError = true;
    } finally {
      setIsCreating(false);
      setCurrentStep(null);
      if (hasError) {
        console.error('Creation process failed');
      } else {
        console.log('All creation steps completed successfully');
      }
    }
  };

  const handleRegionSelect = (region, checked) => {
    setSelectedItems((prev) => {
      // Update region selection
      const newRegions = {
        ...prev.regions,
        [region.data.code]: checked,
      };

      // If unchecking, also uncheck all countries in this region
      const newCountries = { ...prev.countries };
      if (!checked) {
        region.countries.forEach((country) => {
          newCountries[country.data.iso2] = false;
        });
      }

      // Update shipping options if unchecking region
      const newShipping = { ...prev.shipping };
      if (!checked) {
        getRegionShippingOptions(
          region.data.code,
          steps.find((s) => s.id === "shipping").items
        ).forEach((option) => {
          const key = option.type + "-" + option.data.name;
          if (option.data.regionCode !== "all") {
            newShipping[key] = false;
          }
        });
      }

      return {
        ...prev,
        regions: newRegions,
        countries: newCountries,
        shipping: newShipping,
      };
    });
  };

  const handleCountrySelect = (country, checked) => {
    setSelectedItems((prev) => ({
      ...prev,
      countries: {
        ...prev.countries,
        [country.data.iso2]: checked,
      },
    }));
  };

  const handleItemSelect = (stepId, item, checked) => {
    const itemKey =
      item.type + "-" + (item.data.code || item.data.handle || item.data.name);
    setSelectedItems((prev) => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        [itemKey]: checked,
      },
    }));
  };

  const checkStepRequirements = (stepId) => {
    if (stepId === "regions") {
      const selectedRegionsCount = Object.values(selectedItems.regions).filter(
        Boolean
      ).length;
      const selectedCountriesCount = Object.values(
        selectedItems.countries
      ).filter(Boolean).length;
      return selectedRegionsCount >= 1 && selectedCountriesCount >= 1;
    }
    const selectedCount = Object.values(selectedItems[stepId]).filter(
      Boolean
    ).length;
    return (
      selectedCount >=
      (STORE_TEMPLATES[selectedTemplate].requirements[stepId] || 0)
    );
  };

  const meetsAllRequirements = () => {
    return Object.keys(STORE_TEMPLATES[selectedTemplate].requirements).every(
      (stepId) => checkStepRequirements(stepId)
    );
  };

  const getAvailableShippingOptions = () => {
    const selectedRegionCodes = Object.entries(selectedItems.regions)
      .filter(([_, selected]) => selected)
      .map(([code]) => code);

    return steps
      .find((s) => s.id === "shipping")
      .items.filter(
        (item) =>
          item.data.regionCode === "all" ||
          selectedRegionCodes.includes(item.data.regionCode)
      );
  };

  const getAvailableProducts = () => {
    const selectedCategories = Object.entries(selectedItems.categories)
      .filter(([_, selected]) => selected)
      .map(([key]) => key.replace("productCategory-", ""));

    return steps
      .find((s) => s.id === "products")
      .items.filter((product) =>
        product.data.productCategories.connect.some((cat) =>
          selectedCategories.includes(cat.handle)
        )
      );
  };

  const handleCategorySelect = (category, checked) => {
    setSelectedItems((prev) => {
      const categoryKey = "productCategory-" + category.data.handle;
      const newCategories = {
        ...prev.categories,
        [categoryKey]: checked,
      };

      // Update products in this category
      const newProducts = { ...prev.products };
      if (!checked) {
        getDependentProducts(
          category.data.handle,
          steps.find((s) => s.id === "products").items
        ).forEach((product) => {
          const key = product.type + "-" + product.data.handle;
          newProducts[key] = false;
        });
      }

      return {
        ...prev,
        categories: newCategories,
        products: newProducts,
      };
    });
  };

  const getSelectionCount = (stepId) => {
    if (stepId === "regions") {
      return Object.values(selectedItems.regions).filter(Boolean).length;
    }
    return Object.values(selectedItems[stepId]).filter(Boolean).length;
  };

  const applyTemplate = async (template) => {
    setIsApplyingTemplate(true);
    setSelectedTemplate(template);
    
    // Simulate a brief loading state to show the visual feedback
    await new Promise(resolve => setTimeout(resolve, 600));
    
    setSelectedItems((prev) => {
      const newState = { ...prev };

      // Reset all selections first
      Object.keys(STORE_TEMPLATES[template].requirements).forEach((stepId) => {
        if (stepId === "regions") {
          newState.regions = {};
          newState.countries = {};
          steps
            .find((s) => s.id === "regions")
            .items.forEach((region, index) => {
              if (index < STORE_TEMPLATES[template].requirements.regions) {
                newState.regions[region.data.code] = true;
                region.countries.forEach((country) => {
                  newState.countries[country.data.iso2] = true;
                });
              } else {
                newState.regions[region.data.code] = false;
                region.countries.forEach((country) => {
                  newState.countries[country.data.iso2] = false;
                });
              }
            });
        } else {
          newState[stepId] = {};
          steps
            .find((s) => s.id === stepId)
            .items.forEach((item, index) => {
              const key =
                item.type +
                "-" +
                (item.data.code || item.data.handle || item.data.name);
              newState[stepId][key] =
                index < STORE_TEMPLATES[template].requirements[stepId];
            });
        }
      });

      return newState;
    });
    
    setIsApplyingTemplate(false);
  };

  // if (parseInt(data?.["Region"]) > 0) {
  //   return null;
  // }

  return (
    <div className="bg-muted/40 rounded-xl p-4 border">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-foreground/75 uppercase">
            Welcome to Openfront
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Let's set up your store with the essential configurations.
          </p>
        </div>

        <div className="inline-flex -space-x-px divide-x divide-primary-foreground/30 rounded-lg shadow-sm shadow-black/5 rtl:space-x-reverse">
          <Button 
            onClick={handleCreateAll}
            disabled={isCreating || isApplyingTemplate || !meetsAllRequirements()} 
            className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 relative ps-12"
          >
            {isCreating ? "Creating..." : "Create Store"}
            <span className="pointer-events-none absolute inset-y-0 start-0 flex w-9 items-center justify-center bg-primary-foreground/15">
              <Building2
                className="opacity-60"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
            </span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                disabled={isCreating || isApplyingTemplate}
                className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
                size="icon"
                aria-label="Store Templates"
              >
                <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="max-w-64 md:max-w-xs"
              side="bottom"
              sideOffset={4}
              align="end"
            >
              <DropdownMenuRadioGroup value={selectedTemplate} onValueChange={applyTemplate}>
                {Object.entries(STORE_TEMPLATES).map(([key, template]) => (
                  <DropdownMenuRadioItem
                    key={key}
                    value={key}
                    className="items-start [&>span]:pt-1.5"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">{template.name}</span>
                      <span className="text-xs text-muted-foreground">{template.description}</span>
                    </div>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {steps.map((step) => (
          <Accordion
            key={step.id}
            type="single"
            collapsible
            defaultOpen={stepStatuses[step.id] === "current"}
            className="bg-background"
          >
            <AccordionItem value={step.id} className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline data-[state=open]:border-b">
                <div className="flex items-center space-x-3">
                  <span
                    className="flex size-5 items-center justify-center"
                    aria-hidden={true}
                  >
                    {stepStatuses[step.id] === "complete" ? (
                      <RiCheckboxCircleFill
                        className="size-6 shrink-0 text-emerald-500"
                        aria-hidden={true}
                      />
                    ) : stepStatuses[step.id] === "error" ? (
                      <AlertCircle
                        className="size-6 shrink-0 text-red-500"
                        aria-hidden={true}
                      />
                    ) : stepStatuses[step.id] === "loading" || (isCreating && currentStep === step.id) ? (
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    ) : checkStepRequirements(step.id) ? (
                      <RiCheckboxCircleFill
                        className="size-6 shrink-0 text-zinc-500"
                        aria-hidden={true}
                      />
                    ) : (
                      <CircleDashed className="h-5 w-5 text-muted-foreground" />
                    )}
                  </span>
                  <div className="flex flex-col items-start text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{step.title}</p>
                      <div className="-me-1 ms-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                        {getSelectionCount(step.id)}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stepStatuses[step.id] === "error" ? (
                        <span className="text-red-500">Failed to create - please try again</span>
                      ) : (
                        <>
                          {step.subtitle}
                          {!checkStepRequirements(step.id) &&
                            STORE_TEMPLATES[selectedTemplate].requirements[
                              step.id
                            ] > 0 && (
                              <span className="ml-1 text-xs text-muted-foreground/60">
                                (Select at least{" "}
                                {
                                  STORE_TEMPLATES[selectedTemplate].requirements[
                                    step.id
                                  ]
                                }
                                )
                              </span>
                            )}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4">
                <div className="rounded-lg bg-muted/50 p-2 border">
                  <div className="w-full">
                    {step.items.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {step.id === "regions" ? (
                          <div className="flex gap-10 flex-wrap">
                            {step.items.map((region) => (
                              <RegionCheckboxCard
                                key={region.data.code}
                                region={region}
                                checked={
                                  selectedItems.regions[region.data.code]
                                }
                                onCheckedChange={(checked) =>
                                  handleRegionSelect(region, checked)
                                }
                                countryStates={selectedItems.countries}
                                onCountryChange={handleCountrySelect}
                                disabled={isCreating}
                              />
                            ))}
                          </div>
                        ) : step.id === "shipping" ? (
                          getAvailableShippingOptions().map((item) => (
                            <CheckboxCard
                              key={item.type + "-" + item.data.name}
                              title={item.title}
                              checked={
                                selectedItems[step.id][
                                  item.type + "-" + item.data.name
                                ]
                              }
                              onCheckedChange={(checked) =>
                                handleItemSelect(step.id, item, checked)
                              }
                              disabled={isCreating}
                            />
                          ))
                        ) : step.id === "categories" ? (
                          step.items.map((item) => (
                            <CheckboxCard
                              key={item.type + "-" + item.data.handle}
                              title={item.title}
                              checked={
                                selectedItems[step.id][
                                  item.type + "-" + item.data.handle
                                ]
                              }
                              onCheckedChange={(checked) =>
                                handleCategorySelect(item, checked)
                              }
                              disabled={isCreating}
                            />
                          ))
                        ) : step.id === "products" ? (
                          getAvailableProducts().map((item) => (
                            <CheckboxCard
                              key={item.type + "-" + item.data.handle}
                              title={item.title}
                              checked={
                                selectedItems[step.id][
                                  item.type + "-" + item.data.handle
                                ]
                              }
                              onCheckedChange={(checked) =>
                                handleItemSelect(step.id, item, checked)
                              }
                              disabled={isCreating}
                            />
                          ))
                        ) : (
                          step.items.map((item) => (
                            <CheckboxCard
                              key={
                                item.type +
                                "-" +
                                (item.data.code ||
                                  item.data.handle ||
                                  item.data.name)
                              }
                              title={item.title}
                              checked={
                                selectedItems[step.id][
                                  item.type +
                                    "-" +
                                    (item.data.code ||
                                      item.data.handle ||
                                      item.data.name)
                                ]
                              }
                              onCheckedChange={(checked) =>
                                handleItemSelect(step.id, item, checked)
                              }
                              disabled={isCreating}
                            />
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>
    </div>
  );
};
