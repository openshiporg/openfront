import { GraphQLClient, gql } from "graphql-request";
import seedData from "./seed-data.json";

const endpoint = "http://localhost:3000/api/graphql";
const apiKey = "clupcna0j0002wf8cm67qkjfc";

const client = new GraphQLClient(endpoint, {
  headers: {
    "x-api-key": apiKey,
  },
});

const createRegionMutation = gql`
  mutation CreateRegion($data: RegionCreateInput!) {
    createRegion(data: $data) {
      id
    }
  }
`;

const createCategoryMutation = gql`
  mutation CreateProductCategory($data: ProductCategoryCreateInput!) {
    createProductCategory(data: $data) {
      id
    }
  }
`;

const createProductMutation = gql`
  mutation CreateProduct($data: ProductCreateInput!) {
    createProduct(data: $data) {
      id
      productOptions {
        id
        productOptionValues {
          id
          value
        }
      }
    }
  }
`;

const createProductVariantsMutation = gql`
  mutation createProductVariants($data: [ProductVariantCreateInput!]!) {
    createProductVariants(data: $data) {
      id
    }
  }
`;

const createStoreMutation = gql`
  mutation CreateStore($data: StoreCreateInput!) {
    createStore(data: $data) {
      id
    }
  }
`;

const createCurrencyMutation = gql`
  mutation CreateCurrency($data: CurrencyCreateInput!) {
    createCurrency(data: $data) {
      id
    }
  }
`;

const createFulfillmentProviderMutation = gql`
  mutation CreateFulfillmentProvider($data: FulfillmentProviderCreateInput!) {
    createFulfillmentProvider(data: $data) {
      id
    }
  }
`;

const createCountryMutation = gql`
  mutation CreateCountry($data: CountryCreateInput!) {
    createCountry(data: $data) {
      id
    }
  }
`;

const createShippingOptionMutation = gql`
  mutation CreateShippingOption($data: ShippingOptionCreateInput!) {
    createShippingOption(data: $data) {
      id
    }
  }
`;

const createTaxProviderMutation = gql`
  mutation CreateTaxProvider($data: TaxProviderCreateInput!) {
    createTaxProvider(data: $data) {
      id
    }
  }
`;

const createPaymentProviderMutation = gql`
  mutation CreatePaymentProvider($data: PaymentProviderCreateInput!) {
    createPaymentProvider(data: $data) {
      id
    }
  }
`;

const createProductInput = (productData) => {
  const {
    productCollection,
    productCategories,
    shippingProfile,
    productType,
    productOptions,
    productImages,
    productTags,
    taxRates,
    productVariants,
    ...rest
  } = productData;

  return {
    data: {
      ...rest,
      productCollection: productCollection
        ? { connect: { id: productCollection.id } }
        : undefined,
      productCategories: {
        connect: productCategories.map((category) => ({ id: category.id })),
      },
      shippingProfile: shippingProfile
        ? { connect: { id: shippingProfile.id } }
        : undefined,
      productType: productType
        ? { connect: { id: productType.id } }
        : undefined,
      productOptions: {
        connect: productOptions.map((option) => ({ id: option.id })),
      },
      productImages: {
        connect: productImages.map((image) => ({ id: image.id })),
      },
      productTags: {
        connect: productTags.map((tag) => ({ id: tag.id })),
      },
      taxRates: {
        connect: taxRates.map((rate) => ({ id: rate.id })),
      },
      productVariants: {
        connect: productVariants.map((variant) => ({ id: variant.id })),
      },
    },
  };
};

const createProductVariantInput = (variantData) => {
  const { product, productOptionValues, ...rest } = variantData;

  return {
    data: {
      ...rest,
      product: { connect: { id: product.id } },
      productOptionValues: {
        connect: productOptionValues.map((value) => ({ id: value.id })),
      },
    },
  };
};

async function createCategories() {
  const { categories } = seedData;
  const categoryIds = {};

  for (const categoryData of categories) {
    const { createProductCategory } = await client.request(
      createCategoryMutation,
      { data: { title: categoryData.name, handle: categoryData.id } }
    );
    console.log("Product Category created with ID:", createProductCategory.id);
    categoryIds[categoryData.handle] = createProductCategory.id;
  }

  return categoryIds;
}

async function createProducts() {
  const { products } = seedData;
  const productIds = {};

  for (const productData of products) {
    const {
      title,
      categories,
      subtitle,
      description,
      handle,
      is_giftcard,
      weight,
      images,
      options,
      variants,
    } = productData;
    const categoriesInput = categories.map((category) => ({
      handle: category.id,
    }));

    const productInput = {
      title,
      subtitle: subtitle || "",
      description,
      handle,
      isGiftcard: is_giftcard,
      weight,
      productOptions: {
        create: options.map((option) => ({
          title: option.title,
          productOptionValues: {
            create: option.values.map((value) => ({ value })),
          },
        })),
      },
      productCategories: { connect: categoriesInput },
    };

    const { createProduct } = await client.request(createProductMutation, {
      data: productInput,
    });

    function combineProductOptionValues(productList) {
      return productList.reduce((acc, product) => {
        return acc.concat(product.productOptionValues);
      }, []);
    }

    console.log("Product created with ID:", createProduct.productOptions);

    const { createProductVariant } = await client.request(
      createProductVariantsMutation,
      {
        data: variants.map(
          ({
            title,
            prices,
            options,
            inventory_quantity,
            manage_inventory,
          }) => {
            // console.log("options", options);
            // console.log(
            //   "combineProductOptionValues",
            //   combineProductOptionValues(createProduct.productOptions)
            // );
            // console.log(
            //   "Product created with ID:",
            //   combineProductOptionValues(createProduct.productOptions)
            //     .filter((item) =>
            //       options.map((option) => option.value).includes(item.value)
            //     )
            //     .map((item) => ({ id: item.id }))
            // );
            const combinedProductOptionValues = combineProductOptionValues(
              createProduct.productOptions
            );
            const optionValues = options.map((option) => option.value);
            const matchingIds = combinedProductOptionValues
              .filter((item) => optionValues.includes(item.value))
              .map((item) => ({ id: item.id }));
            console.log({ matchingIds });
            return {
              title,
              inventoryQuantity: inventory_quantity,
              manageInventory: manage_inventory,
              prices: {
                create: prices.map(({ currency_code, amount }) => ({
                  amount,
                  currency: { connect: { code: currency_code } },
                })),
              },
              productOptionValues: {
                connect: matchingIds,
              },
              product: {
                connect: { id: createProduct.id },
              },
            };
          }
        ),
      }
    );

    productIds[handle] = createProduct.id;
  }

  return productIds;
}

async function createProductVariants(productIds) {
  const { products } = seedData;

  for (const product of products) {
    for (const variant of product.variants) {
      const variantInput = createProductVariantInput({
        ...variant,
        product: { connect: { id: productIds[product.handle] } },
      });

      await client.request(createProductVariantMutation, variantInput);
    }
  }
}

async function createStore() {
  const { store, currencies } = seedData;
  const { createStore } = await client.request(createStoreMutation, {
    data: { ...store, currencies: { create: currencies } },
  });
  const storeId = createStore.id;
  console.log(`Store created with ID: ${storeId}`);
  return storeId;
}

async function createCurrencies(storeId, createdRegionIds) {
  const currenciesToCreate = seedData.currencies;
  for (const currency of currenciesToCreate) {
    try {
      const { createCurrency } = await client.request(createCurrencyMutation, {
        data: {
          ...currency,
          regions: {
            connect: createdRegionIds,
          },
          stores: {
            connect: { id: storeId },
          },
        },
      });
    } catch (error) {
      console.error(`Error creating currency ${currency.code}:`, error);
    }
  }
}

async function createFulfillmentProvider() {
  const { createFulfillmentProvider } = await client.request(
    createFulfillmentProviderMutation,
    { data: { code: "manual" } }
  );
  console.log(
    "Fulfillment Provider created with ID:",
    createFulfillmentProvider.id
  );
  return createFulfillmentProvider.id;
}

async function createPaymentProvider() {
  const { createPaymentProvider } = await client.request(
    createPaymentProviderMutation,
    { data: { code: "manual" } }
  );
  console.log("Payment Provider created with ID:", createPaymentProvider.id);
  return createPaymentProvider.id;
}

async function createCountries() {
  for (const country of seedData.countries) {
    const countryDataWithRegion = {
      ...country,
    };

    try {
      const { createCountry } = await client.request(createCountryMutation, {
        data: countryDataWithRegion,
      });
      console.log(`Country created: ${country.name}`);
    } catch (error) {
      console.error(`Error creating country ${country.name}:`, error);
    }
  }
}

const createRegions = async () => {
  const { regions } = seedData;
  const createdRegions = []; // Array to store the created regions

  for (const region of regions) {
    const {
      id,
      currency_code,
      countries,
      fulfillment_providers,
      payment_providers,
      tax_rate,
      name,
      ...rest
    } = region;
    const regionInput = {
      name,
      code: id,
      taxRate: tax_rate,
      currency: { connect: { code: currency_code } },
      paymentProviders: {
        connect: payment_providers.map((code) => ({ code })),
      },
      fulfillmentProviders: {
        connect: fulfillment_providers.map((code) => ({ code })),
      },
    };

    console.log(regionInput);
    // Assuming `client.request` is an async call that creates the region and returns its data
    const { createRegion } = await client.request(createRegionMutation, {
      data: regionInput,
    });
    console.log(`Region created with ID: ${createRegion.id}`);

    // Push the created region's ID into the array
    createdRegions.push({ id: createRegion.id });
  }

  // Return the array of created regions' IDs
  return createdRegions;
};

const createShippingOptions = async () => {
  const { shipping_options } = seedData;
  const createdShippingOptions = []; // Array to store the created shipping options

  for (const shippingOption of shipping_options) {
    const {
      name,
      amount,
      data,
      price_type,
      provider_id,
      region_id,
      is_return,
    } = shippingOption;
    const shippingOptionInput = {
      name,
      priceType: price_type,
      amount,
      data,
      isReturn: is_return !== undefined ? is_return : false,
      region: { connect: { code: region_id } },
      fulfillmentProvider: { connect: { code: provider_id } },
    };

    // Assuming `client.request` is an async call that creates the shipping option and returns its data
    const { createShippingOption } = await client.request(
      createShippingOptionMutation,
      { data: shippingOptionInput }
    );
    console.log(`Shipping option created with ID: ${createShippingOption.id}`);

    // Push the created shipping option's ID into the array
    createdShippingOptions.push({ id: createShippingOption.id });
  }

  // Return the array of created shipping options' IDs
  return createdShippingOptions;
};

async function seedDatabase() {
  try {
    // // Create store and currencies
    const storeId = await createStore();

    // // Create payment provider
    const paymentProviderId = await createPaymentProvider();

    // // Create fulfillment provider
    const fulfillmentProviderId = await createFulfillmentProvider();

    // // Create countries
    const createdCountriesIds = await createCountries();

    // Create regions
    const createdRegionIds = await createRegions();

    // Create shipping options
    const createdShippingOptionIds = await createShippingOptions();

    // Create categories first
    const categoryIds = await createCategories();

    // Create products with category IDs
    const productIds = await createProducts();

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seedDatabase();
