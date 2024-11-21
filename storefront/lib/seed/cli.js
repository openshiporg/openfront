import { GraphQLClient, gql } from "graphql-request";
import seedData from "./seed-data.json";
import fs from "fs";
import path from "path";
import Upload from "graphql-upload/Upload.js";

import { keystoneContext } from "../../../keystone/keystoneContext";

const client = {
  request: async (query, variables) => {
    // Remove undefined values from variables
    const cleanVariables = Object.fromEntries(
      Object.entries(variables || {}).filter(
        ([_, value]) => value !== undefined
      )
    );

    // Only include variables if there are any
    const options = {
      query,
      ...(Object.keys(cleanVariables).length > 0 && {
        variables: cleanVariables,
      }),
    };

    const { data, errors } = await keystoneContext.sudo().graphql.raw(options);

    // Convert the data to a plain object before returning
    const plainData = JSON.parse(JSON.stringify(data));

    if (errors) {
      throw errors[0];
    }

    return plainData;
  },
};

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

const createCollectionMutation = gql`
  mutation CreateCollection($data: ProductCollectionCreateInput!) {
    createProductCollection(data: $data) {
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

async function createProducts(categoryIds, collectionIds) {
  const { products, regions } = seedData;
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
      productCollections: {
        connect: productData.collections
          ? productData.collections.map((collection) => ({
              id: collectionIds[collection],
            }))
          : [],
      },
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
                create: prices.map(({ currency_code, amount }) => {
                  // Find the region_id directly inside the map function
                  const region = regions.find(
                    (region) => region.currency_code === currency_code
                  );
                  const region_id = region ? region.id : null;

                  return {
                    amount,
                    currency: { connect: { code: currency_code } },
                    region: { connect: { code: region_id } },
                  };
                }),
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

    // Add image creation after product is created
    await createProductImages(createProduct.id, productData.handle);
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
  for (const { ...country } of seedData.countries) {
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
      countries: {
        connect: countries.map((iso2) => ({ iso2 })),
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

async function createCollections() {
  const { collections } = seedData;
  const collectionIds = {};

  for (const collectionData of collections) {
    const { createProductCollection } = await client.request(
      createCollectionMutation,
      { data: { title: collectionData.title, handle: collectionData.handle } }
    );
    console.log(
      "Product Collection created with ID:",
      createProductCollection.id
    );
    collectionIds[collectionData.handle] = createProductCollection.id;
  }

  return collectionIds;
}

async function createProductImages(productId, handle) {
  try {
    const filename = `${handle}.jpeg`;
    // Assume images are in the correct location relative to this file
    const imagePath = `/images/${filename}`; // Simple path to image

    const upload = prepareToUpload(imagePath);

    const { data, errors } = await client.request(
      `mutation CreateProductImage($data: ProductImageCreateInput!) {
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
    `,
      {
        data: {
          image: {
            upload,
          },
          products: {
            connect: [{ id: productId }],
          },
        },
      }
    );

    if (errors) {
      throw new Error(errors[0].message);
    }

    console.log("Product image created successfully:", data.createProductImage);
    return data.createProductImage;
  } catch (error) {
    console.error("Error creating product images:", error);
    throw error;
  }
}

const prepareToUpload = (filePath) => {
  const filename = path.basename(filePath);
  const stream = fs.createReadStream(filePath);
  const createReadStream = () => stream;

  const mimetype = 'image/jpeg';
  const encoding = 'utf-8';

  const image = {
    createReadStream,
    filename,
    mimetype,
    encoding,
  };

  const upload = new Upload();
  upload.resolve(image);

  return upload;
};

async function createTestImage() {
  try {
    const filename = "eschers-staircase-hoodie.jpeg";
    const imagesDir = path.join(__dirname, "images");
    const imagePath = path.join(imagesDir, filename);

    if (!fs.existsSync(imagePath)) {
      console.log(`File not found: ${imagePath}`);
      return;
    }

    const upload = prepareToUpload(imagePath);

    const { data, errors } = await keystoneContext.sudo().graphql.raw({
      query: `
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
      `,
      variables: {
        data: {
          image: {
            upload
          }
        }
      }
    });

    if (errors) {
      throw new Error(errors[0].message);
    }

    console.log("Test image created successfully:", data.createProductImage);
    return data.createProductImage;
  } catch (error) {
    console.error("Error creating test image:", error);
    throw error;
  }
}

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

    // Create collections
    const collectionIds = await createCollections();

    // Create categories first
    const categoryIds = await createCategories();

    // Create products with category IDs and collection IDs
    const productIds = await createProducts(categoryIds, collectionIds);

    // Create test image
    // const testImage = await createTestImage();

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seedDatabase();
