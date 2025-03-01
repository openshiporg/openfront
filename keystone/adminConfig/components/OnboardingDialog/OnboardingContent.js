import { useState } from "react";
import { useKeystone } from "@keystone/keystoneProvider";
import { gql, useMutation } from "@keystone-6/core/admin-ui/apollo";
import SelectableBadge from "./SelectableBadge";
import PaymentProviderBadge from "./PaymentProviderBadge";
import RegionBadge from "./RegionBadge";
import CreationStep from "./CreationStep";
import { Button } from "@keystone/themes/Tailwind/orion/primitives/default/ui/button";
import { RadioGroup, RadioGroupItem } from "@keystone/themes/Tailwind/orion/primitives/default/ui/radio-group";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@keystone/themes/Tailwind/orion/primitives/default/ui/dialog";
import { ArrowRight, Settings, Loader2, Building2 } from "lucide-react";
import { steps, STORE_TEMPLATES } from "./config";

const OnboardingContent = ({ data, onClose }) => {
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
            [item.data.code || item.data.handle || item.data.name]: true,
          }),
          {}
        );
      }
    });
    return initial;
  });

  const [isCreating, setIsCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState("full");
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);

  const [createCurrency] = useMutation(gql`
    mutation CreateCurrency($data: CurrencyCreateInput!) {
      createCurrency(data: $data) {
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

  const [createPaymentProvider] = useMutation(gql`
    mutation CreatePaymentProvider($data: PaymentProviderCreateInput!) {
      createPaymentProvider(data: $data) {
        id
        code
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

  const [creationProgress, setCreationProgress] = useState({
    "payment-providers": [],
    regions: [],
    shipping: [],
    categories: [],
    collections: [],
    products: [],
    currencies: [],
    storefrontUrl: null,
  });

  // Add helper function to check for unique constraint errors
  const isUniqueConstraintError = (error) => {
    return error?.message?.toLowerCase().includes("unique constraint") || 
           error?.message?.toLowerCase().includes("duplicate key") ||
           error?.message?.toLowerCase().includes("already exists");
  };

  const handleRegionSelect = (region, checked) => {
    // If unchecking a region, ensure at least one country remains selected
    if (!checked) {
      const otherRegionsCountries = steps
        .find((s) => s.id === "regions")
        .items.filter((r) => r.data.code !== region.data.code)
        .flatMap((r) => r.countries)
        .map((c) => c.data.iso2);

      const selectedCountriesInOtherRegions = Object.entries(
        selectedItems.countries
      ).filter(
        ([iso2, isSelected]) =>
          isSelected && otherRegionsCountries.includes(iso2)
      ).length;

      if (selectedCountriesInOtherRegions === 0) {
        return; // Prevent deselecting if no countries would remain selected
      }
    }

    setSelectedItems((prev) => {
      const newRegions = {
        ...prev.regions,
        [region.data.code]: checked,
      };

      const newCountries = { ...prev.countries };
      region.countries.forEach((country) => {
        newCountries[country.data.iso2] = checked;
      });

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
    // Prevent deselecting if it's the last selected country
    if (!checked) {
      const currentSelected = Object.values(selectedItems.countries).filter(
        Boolean
      ).length;
      if (currentSelected <= 1) {
        return;
      }
    }

    setSelectedItems((prev) => ({
      ...prev,
      countries: {
        ...prev.countries,
        [country.data.iso2]: checked,
      },
    }));
  };

  const handleItemSelect = (stepId, item, checked) => {
    const itemKey = item.data.code || item.data.handle || item.data.name;

    // Prevent deselecting if it's the last selected item
    if (!checked) {
      const currentSelected = Object.values(selectedItems[stepId]).filter(
        Boolean
      ).length;
      if (currentSelected <= 1) {
        return;
      }
    }

    setSelectedItems((prev) => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        [itemKey]: checked,
      },
    }));
  };

  const getSelectionCount = (stepId) => {
    if (stepId === "regions") {
      return Object.values(selectedItems.regions).filter(Boolean).length;
    }
    return Object.values(selectedItems[stepId]).filter(Boolean).length;
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
    if (selectedTemplate === "customize") {
      // For customize, check if at least one of each required type is selected
      return [
        "regions",
        "payment-providers",
        "shipping",
        "categories",
        "products",
      ].every((stepId) => {
        const count = getSelectionCount(stepId);
        return count >= 1;
      });
    }
    return Object.keys(STORE_TEMPLATES[selectedTemplate].requirements).every(
      (stepId) => checkStepRequirements(stepId)
    );
  };

  const getRegionShippingOptions = (regionCode, shippingOptions) => {
    return shippingOptions.filter(
      (option) =>
        option.data.regionCode === regionCode ||
        option.data.regionCode === "all"
    );
  };

  const applyTemplate = async (template) => {
    setIsApplyingTemplate(true);
    setSelectedTemplate(template);

    await new Promise((resolve) => setTimeout(resolve, 600));

    setSelectedItems((prev) => {
      const newState = { ...prev };

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

  const handleCreateAll = async () => {
    setIsCreating(true);
    
    // Create regions first
    const selectedRegions = Object.entries(selectedItems.regions)
      .filter(([_, selected]) => selected)
      .map(([code]) => code);

    const selectedCountries = Object.entries(selectedItems.countries)
      .filter(([_, selected]) => selected)
      .map(([code]) => code);

    // Step 1: Create currencies
    const currencyMap = new Map();
    for (const regionCode of selectedRegions) {
      const region = steps.find(s => s.id === "regions").items.find(r => r.data.code === regionCode);
      try {
        console.log('Creating currency for region:', {
          regionCode,
          currencyCode: region.data.currencyCode,
          currencySymbol: region.data.currencySymbol,
          currencyName: region.data.currencyName
        });
        
        const { data: currencyResult, errors } = await createCurrency({
          variables: {
            data: {
              code: region.data.currencyCode,
              symbol: region.data.currencySymbol,
              symbolNative: region.data.currencySymbol,
              name: region.data.currencyName,
            }
          },
          errorPolicy: 'all'
        }).catch(error => {
          // Handle network/other errors
          return { errors: [error] };
        });
        
        if (errors?.some(e => isUniqueConstraintError(e))) {
          currencyMap.set(region.data.currencyCode, { code: region.data.currencyCode });
          setCreationProgress(prev => ({
            ...prev,
            currencies: [...prev.currencies, { code: region.data.currencyCode, status: "skipped" }]
          }));
          console.log('Currency already exists, skipping:', region.data.currencyCode);
          continue;
        }

        if (currencyResult?.createCurrency) {
          currencyMap.set(region.data.currencyCode, currencyResult.createCurrency);
          setCreationProgress(prev => ({
            ...prev,
            currencies: [...prev.currencies, { code: region.data.currencyCode, status: "complete" }]
          }));
          console.log('Added currency to map:', {
            code: region.data.currencyCode,
            currency: currencyResult.createCurrency
          });
        } else if (errors) {
          throw new Error(errors[0].message);
        }
      } catch (error) {
        console.error('Error creating currency:', {
          regionCode,
          error: error.message
        });
        
        if (isUniqueConstraintError(error)) {
          currencyMap.set(region.data.currencyCode, { code: region.data.currencyCode });
          setCreationProgress(prev => ({
            ...prev,
            currencies: [...prev.currencies, { code: region.data.currencyCode, status: "skipped" }]
          }));
        } else {
          setCreationProgress(prev => ({
            ...prev,
            currencies: [...prev.currencies, { code: region.data.currencyCode, status: "error", error: error.message }]
          }));
          // Don't throw the error, just log it and continue
          console.error('Non-constraint error creating currency:', error);
        }
      }
    }
    console.log('Final currency map:', Array.from(currencyMap.entries()));

    // Step 2: Create countries
    const countryMap = new Map();
    for (const regionCode of selectedRegions) {
      const region = steps.find(s => s.id === "regions").items.find(r => r.data.code === regionCode);
      for (const country of region.countries) {
        if (selectedCountries.includes(country.data.iso2)) {
          try {
            const { data: countryResult } = await createCountry({
              variables: {
                data: {
                  ...country.data,
                  name: country.title
                }
              }
            });
            if (countryResult?.createCountry) {
              countryMap.set(country.data.iso2, countryResult.createCountry);
            }
          } catch (error) {
            if (isUniqueConstraintError(error)) {
              countryMap.set(country.data.iso2, { iso2: country.data.iso2 });
            }
          }
        }
      }
    }

    // Step 3: Create regions with verified connections
    for (const regionCode of selectedRegions) {
      const region = steps.find(s => s.id === "regions").items.find(r => r.data.code === regionCode);
      try {
        const verifiedCountries = region.countries
          .filter(country => selectedCountries.includes(country.data.iso2))
          .filter(country => countryMap.has(country.data.iso2))
          .map(country => ({ iso2: country.data.iso2 }));

        // First check if region exists
        try {
          await createRegion({
            variables: {
              data: {
                name: region.data.name,
                code: region.data.code,
                taxRate: region.data.taxRate,
                currency: currencyMap.has(region.data.currencyCode) 
                  ? { connect: { code: region.data.currencyCode } }
                  : undefined,
                countries: {
                  connect: verifiedCountries
                }
              }
            }
          });
          setCreationProgress(prev => ({
            ...prev,
            regions: [...prev.regions, { code: regionCode, status: "complete" }]
          }));
        } catch (error) {
          if (isUniqueConstraintError(error)) {
            // If region exists, mark as skipped
            setCreationProgress(prev => ({
              ...prev,
              regions: [...prev.regions, { code: regionCode, status: "skipped" }]
            }));
          } else {
            throw error; // Re-throw other errors
          }
        }
      } catch (error) {
        setCreationProgress(prev => ({
          ...prev,
          regions: [...prev.regions, { code: regionCode, status: "error", error: error.message }]
        }));
      }
    }

    // Step 4: Create payment providers
    const selectedProviders = Object.entries(selectedItems["payment-providers"])
      .filter(([_, selected]) => selected)
      .map(([code]) => code);

    for (const providerCode of selectedProviders) {
      const provider = steps.find(s => s.id === "payment-providers").items.find(p => p.data.code === providerCode);
      try {
        await createPaymentProvider({
          variables: {
            data: {
              name: provider.data.name,
              code: provider.data.code,
              isInstalled: provider.data.isInstalled,
              createPaymentFunction: provider.data.createPaymentFunction,
              capturePaymentFunction: provider.data.capturePaymentFunction,
              refundPaymentFunction: provider.data.refundPaymentFunction,
              getPaymentStatusFunction: provider.data.getPaymentStatusFunction,
              generatePaymentLinkFunction: provider.data.generatePaymentLinkFunction,
              handleWebhookFunction: provider.data.handleWebhookFunction,
              regions: {
                connect: selectedRegions.map(code => ({ code }))
              }
            }
          }
        });
        setCreationProgress(prev => ({
          ...prev,
          "payment-providers": [...prev["payment-providers"], { code: providerCode, status: "complete" }]
        }));
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          setCreationProgress(prev => ({
            ...prev,
            "payment-providers": [...prev["payment-providers"], { code: providerCode, status: "skipped" }]
          }));
        } else {
          setCreationProgress(prev => ({
            ...prev,
            "payment-providers": [...prev["payment-providers"], { code: providerCode, status: "error", error: error.message }]
          }));
        }
      }
    }

    // Step 5: Create fulfillment provider
    try {
      await createFulfillmentProvider({
        variables: {
          data: {
            code: "fp_manual",
            name: "Manual Fulfillment",
            isInstalled: true
          }
        }
      });
    } catch (error) {
      // Ignore if already exists
      console.log('Fulfillment provider might already exist:', error.message);
    }

    // Step 6: Create shipping options
    const selectedShipping = Object.entries(selectedItems.shipping)
      .filter(([_, selected]) => selected)
      .map(([name]) => name);

    // Get all selected regions first
    const selectedRegionCodes = Object.entries(selectedItems.regions)
      .filter(([_, selected]) => selected)
      .map(([code]) => code);

    for (const shippingName of selectedShipping) {
      const option = steps.find(s => s.id === "shipping").items.find(o => o.data.name === shippingName);
      
      // If regionCode is "all", create for each selected region
      const regionsToCreate = option.data.regionCode === "all" ? selectedRegionCodes : [option.data.regionCode];
      
      for (const regionCode of regionsToCreate) {
        try {
          await createShippingOption({
            variables: {
              data: {
                name: option.data.name,
                priceType: option.data.priceType,
                amount: option.data.amount,
                isReturn: option.data.isReturn || false,
                uniqueKey: `${option.data.name}-${regionCode}`,
                fulfillmentProvider: { connect: { code: "fp_manual" } },
                region: { connect: { code: regionCode } }
              }
            }
          });
          setCreationProgress(prev => ({
            ...prev,
            shipping: [...prev.shipping, { 
              name: `${option.data.name} (${regionCode})`, 
              status: "complete" 
            }]
          }));
        } catch (error) {
          if (isUniqueConstraintError(error)) {
            setCreationProgress(prev => ({
              ...prev,
              shipping: [...prev.shipping, { 
                name: `${option.data.name} (${regionCode})`, 
                status: "skipped" 
              }]
            }));
          } else {
            setCreationProgress(prev => ({
              ...prev,
              shipping: [...prev.shipping, { 
                name: `${option.data.name} (${regionCode})`, 
                status: "error", 
                error: error.message 
              }]
            }));
          }
        }
      }
    }

    // Step 7: Create categories
    const selectedCategories = Object.entries(selectedItems.categories)
      .filter(([_, selected]) => selected)
      .map(([handle]) => handle);

    for (const categoryHandle of selectedCategories) {
      const category = steps.find(s => s.id === "categories").items.find(c => c.data.handle === categoryHandle);
      try {
        // First check if category exists
        try {
          await createProductCategory({
            variables: {
              data: {
                title: category.data.name,
                handle: category.data.handle,
                isActive: category.data.isActive
              }
            }
          });
          setCreationProgress(prev => ({
            ...prev,
            categories: [...prev.categories, { name: category.data.name, status: "complete" }]
          }));
        } catch (error) {
          if (isUniqueConstraintError(error)) {
            setCreationProgress(prev => ({
              ...prev,
              categories: [...prev.categories, { name: category.data.name, status: "skipped" }]
            }));
          } else {
            throw error; // Re-throw other errors
          }
        }
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          setCreationProgress(prev => ({
            ...prev,
            categories: [...prev.categories, { name: category.data.name, status: "skipped" }]
          }));
        } else {
          setCreationProgress(prev => ({
            ...prev,
            categories: [...prev.categories, { name: category.data.name, status: "error", error: error.message }]
          }));
        }
      }
    }

    // Step 8: Create collections
    const selectedCollections = Object.entries(selectedItems.collections)
      .filter(([_, selected]) => selected)
      .map(([handle]) => handle);

    for (const collectionHandle of selectedCollections) {
      const collection = steps.find(s => s.id === "collections").items.find(c => c.data.handle === collectionHandle);
      console.log('Creating collection:', collection);
      console.log({collectionHandle});
      try {
        await createProductCollection({
          variables: {
            data: {
              title: collection.data.title,
              handle: collection.data.handle
            }
          }
        });
        setCreationProgress(prev => ({
          ...prev,
          collections: [...prev.collections, { handle: collectionHandle, status: "complete" }]
        }));
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          setCreationProgress(prev => ({
            ...prev,
            collections: [...prev.collections, { handle: collectionHandle, status: "skipped" }]
          }));
        } else {
          setCreationProgress(prev => ({
            ...prev,
            collections: [...prev.collections, { handle: collectionHandle, status: "error", error: error.message }]
          }));
        }
      }
    }

    // Create products
    const selectedProducts = Object.entries(selectedItems.products)
      .filter(([_, selected]) => selected)
      .map(([handle]) => handle);

    for (const productHandle of selectedProducts) {
      const product = steps.find(s => s.id === "products").items.find(p => p.data.handle === productHandle);
      try {
        console.log('Creating product:', {
          handle: product.data.handle,
          title: product.data.title,
          categories: product.data.productCategories,
          collections: product.data.productCollections,
          options: product.data.productOptions
        });

        // Create the product and capture the response
        const { data: productResponse } = await createProduct({
          variables: {
            data: {
              title: product.data.title,
              subtitle: product.data.subtitle || "",
              description: product.data.description,
              handle: product.data.handle,
              isGiftcard: product.data.isGiftcard,
              status: product.data.status,
              productCategories: product.data.productCategories,
              productCollections: product.data.productCollections,
              productOptions: product.data.productOptions,
              productImages: {
                create: [{
                  imagePath: `/images/${product.data.handle}.jpeg`,
                  altText: product.data.title
                }]
              }
            }
          }
        });

        if (!productResponse?.createProduct) {
          throw new Error(`Failed to create product ${product.data.title}`);
        }

        const newProduct = productResponse.createProduct;
        console.log('Product created successfully:', newProduct);

        // Gather all option values from the created product
        const allOptionValues = newProduct.productOptions.reduce((acc, option) => acc.concat(option.productOptionValues), []);

        // Create variants for the product
        for (const variant of product.data.variants) {
          try {
            console.log('Creating variant:', {
              title: variant.title,
              options: variant.options,
              prices: variant.prices
            });

            // Map variant option values to matching IDs
            const optionValues = variant.options.map(opt => opt.value);
            const matchingIds = allOptionValues
              .filter(ov => optionValues.includes(ov.value))
              .map(ov => ({ id: ov.id }));

            console.log('Matched option values:', matchingIds);

            // Map each price using our currencyMap if the currency is available
            const verifiedPrices = variant.prices.map(price => ({
              amount: price.amount,
              currency: { connect: { code: price.currencyCode } },
              region: { connect: { code: price.regionCode } }
            }));

            if (verifiedPrices.length === 0) {
              throw new Error(`No valid prices found for variant ${variant.title}`);
            }

            const { data: variantResponse } = await createProductVariant({
              variables: {
                data: {
                  title: variant.title,
                  inventoryQuantity: variant.inventoryQuantity,
                  manageInventory: variant.manageInventory,
                  product: { connect: { id: newProduct.id } },
                  productOptionValues: { connect: matchingIds },
                  prices: { create: verifiedPrices }
                }
              }
            });

            console.log('Created variant:', variantResponse?.createProductVariant);
          } catch (error) {
            console.error('Failed to create variant:', {
              variantTitle: variant.title,
              error: error.message
            });
            throw error;
          }
        }

        setCreationProgress(prev => ({
          ...prev,
          products: [...prev.products, { handle: productHandle, status: "complete" }]
        }));
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          setCreationProgress(prev => ({
            ...prev,
            products: [...prev.products, { handle: productHandle, status: "skipped" }]
          }));
        } else {
          setCreationProgress(prev => ({
            ...prev,
            products: [...prev.products, { handle: productHandle, status: "error", error: error.message }]
          }));
        }
      }
    }

    // Set storefront URL after everything is created
    const firstRegion = selectedRegions[0];
    if (firstRegion) {
      setCreationProgress(prev => ({
        ...prev,
        storefrontUrl: true
      }));
    }
  };

  const handleCustomize = () => {
    setIsApplyingTemplate(true);
    setCurrentStep(2); // This is fine, but we need to ensure currentStep is initialized properly
  };

  const stepContent = [
    {
      title: "Welcome to Openfront",
      description:
        "Let's set up your store with the essential configurations. Choose a setup template to get started.",
      content: (
        <RadioGroup
          value={selectedTemplate}
          onValueChange={(value) => {
            setSelectedTemplate(value);
          }}
        >
          <label className="relative flex w-full cursor-pointer items-start gap-2 rounded-lg border border-input px-4 py-3 text-left shadow-sm shadow-black/5 outline-offset-2 transition-colors has-[[data-disabled]]:cursor-not-allowed has-[[data-state=checked]]:border-ring has-[[data-state=checked]]:bg-accent has-[[data-disabled]]:opacity-50 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring/70">
            <RadioGroupItem
              value="full"
              id="template-full"
              aria-describedby="template-full-description"
              className="sr-only after:absolute after:inset-0"
            />
            <div className="grid grow gap-1">
              <p className="text-sm font-medium leading-none text-foreground">
                Complete Setup
              </p>
              <p
                id="template-full-description"
                className="text-xs text-muted-foreground"
              >
                Start with a fully configured store including multiple regions,
                payment methods, and a rich product catalog
              </p>
            </div>
          </label>
          <label className="relative flex w-full cursor-pointer items-start gap-2 rounded-lg border border-input px-4 py-3 text-left shadow-sm shadow-black/5 outline-offset-2 transition-colors has-[[data-disabled]]:cursor-not-allowed has-[[data-state=checked]]:border-ring has-[[data-state=checked]]:bg-accent has-[[data-disabled]]:opacity-50 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring/70">
            <RadioGroupItem
              value="minimal"
              id="template-minimal"
              aria-describedby="template-minimal-description"
              className="sr-only after:absolute after:inset-0"
            />
            <div className="grid grow gap-1">
              <p className="text-sm font-medium leading-none text-foreground">
                Basic Setup
              </p>
              <p
                id="template-minimal-description"
                className="text-xs text-muted-foreground"
              >
                Start with just the essentials - perfect for testing or simple
                stores
              </p>
            </div>
          </label>
          {/* <label className="relative flex w-full cursor-pointer items-start gap-2 rounded-lg border border-input px-4 py-3 text-left shadow-sm shadow-black/5 outline-offset-2 transition-colors has-[[data-disabled]]:cursor-not-allowed has-[[data-state=checked]]:border-ring has-[[data-state=checked]]:bg-accent has-[[data-disabled]]:opacity-50 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring/70">
            <RadioGroupItem
              value="customize"
              id="template-customize"
              aria-describedby="template-customize-description"
              className="sr-only after:absolute after:inset-0"
            />
            <div className="grid grow gap-1">
              <p className="text-sm font-medium leading-none text-foreground">
                Customize Setup
              </p>
              <p
                id="template-customize-description"
                className="text-xs text-muted-foreground"
              >
                Manually select regions, payment methods, and other
                configurations
              </p>
            </div>
          </label> */}
        </RadioGroup>
      ),
    },
    ...steps.map((step) => ({
      title: step.title,
      description: step.subtitle,
      content: (
        <div className="space-y-4">
          {step.id === "payment-providers" ? (
            <div className="flex flex-wrap gap-2">
              {step.items.map((provider) => (
                <PaymentProviderBadge
                  key={`paymentProvider-${provider.data.code}`}
                  provider={provider}
                  checked={
                    selectedItems[step.id][
                      `paymentProvider-${provider.data.code}`
                    ]
                  }
                  onCheckedChange={(checked) =>
                    handleItemSelect(step.id, provider, checked)
                  }
                  disabled={isCreating}
                />
              ))}
            </div>
          ) : step.id === "regions" ? (
            <div className="space-y-4">
              {step.items.map((region) => (
                <RegionBadge
                  key={region.data.code}
                  region={region}
                  checked={selectedItems.regions[region.data.code]}
                  onCheckedChange={(checked) =>
                    handleRegionSelect(region, checked)
                  }
                  countryStates={selectedItems.countries}
                  onCountryChange={handleCountrySelect}
                  disabled={isCreating}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {step.items.map((item) => (
                <SelectableBadge
                  key={
                    item.type +
                    "-" +
                    (item.data.code || item.data.handle || item.data.name)
                  }
                  title={item.title}
                  checked={
                    selectedItems[step.id][
                      item.type +
                        "-" +
                        (item.data.code || item.data.handle || item.data.name)
                    ]
                  }
                  onCheckedChange={(checked) =>
                    handleItemSelect(step.id, item, checked)
                  }
                  disabled={isCreating}
                  description={item.description}
                />
              ))}
            </div>
          )}
        </div>
      ),
    })),
  ];

  const totalSteps = isApplyingTemplate ? stepContent.length : 1;

  const handleContinue = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="flex flex-col max-h-[80vh]">
      <DialogHeader className="flex-none px-6 py-4 border-b mr-0">
        <DialogTitle>
          {isCreating ? "Creating Store..." : stepContent[currentStep - 1]?.title}
        </DialogTitle>
        <DialogDescription>
          {isCreating
            ? "Setting up your store configuration"
            : stepContent[currentStep - 1]?.description}
        </DialogDescription>
      </DialogHeader>

      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
        {isCreating ? (
          <CreationStep items={selectedItems} creationProgress={creationProgress} />
        ) : (
          stepContent[currentStep - 1]?.content
        )}
      </div>

      <DialogFooter className="flex-none px-6 py-4 border-t">
        {currentStep === 1 ? (
          <>
            {isCreating && !creationProgress.storefrontUrl ? (
              <Button
                className="gap-2 relative ps-12"
                disabled
              >
                <span className="pointer-events-none absolute inset-y-0 start-0 flex w-9 items-center justify-center bg-primary-foreground/15">
                  <Loader2
                    className="opacity-60 animate-spin"
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </span>
                Creating...
              </Button>
            ) : creationProgress.storefrontUrl ? (
              <Button
                onClick={onClose}
                className="gap-2"
              >
                Close
              </Button>
            ) : (
              <Button
                className="gap-2 relative ps-12"
                onClick={handleCreateAll}
                disabled={!meetsAllRequirements()}
              >
                <span className="pointer-events-none absolute inset-y-0 start-0 flex w-9 items-center justify-center bg-primary-foreground/15">
                  <Building2
                    className="opacity-60"
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </span>
                Create {selectedTemplate === "full" ? "Complete" : "Basic"} Store
              </Button>
            )}
          </>
        ) : (
          <>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="group"
                disabled={isCreating}
              >
                <ArrowRight
                  className="-ml-1 mr-2 rotate-180 opacity-60 transition-transform group-hover:-translate-x-0.5"
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                Previous
              </Button>
            )}
            {currentStep < totalSteps ? (
              <Button
                className="group"
                type="button"
                onClick={handleContinue}
                disabled={isCreating}
              >
                Next
                <ArrowRight
                  className="-me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5"
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </Button>
            ) : (
              <Button
                className="gap-2 relative ps-12"
                onClick={handleCreateAll}
                disabled={isCreating || !meetsAllRequirements()}
              >
                {isCreating ? (
                   <>
                   <span className="pointer-events-none absolute inset-y-0 start-0 flex w-9 items-center justify-center bg-primary-foreground/15">
                     <Loader2
                       className="opacity-60 animate-spin"
                       size={16}
                       strokeWidth={2}
                       aria-hidden="true"
                     />
                   </span>
                   Creating...
                 </>
                ) : (
                  <>
                    <span className="pointer-events-none absolute inset-y-0 start-0 flex w-9 items-center justify-center bg-primary-foreground/15">
                      <Building2
                        className="opacity-60"
                        size={16}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </span>
                    Create Store
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </DialogFooter>
    </div>
  );
};

export default OnboardingContent; 