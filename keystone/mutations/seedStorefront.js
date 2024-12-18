"use server";

import Upload from "graphql-upload/Upload.js";
import fs from 'fs';
import path from 'path';
import seedData from "../../storefront/lib/seed/seed-data.json";

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

function combineProductOptionValues(productList) {
  return productList.reduce((acc, product) => {
    return acc.concat(product.productOptionValues);
  }, []);
}

async function seedStorefront(root, args, context) {
  // Check if user is authenticated
  if (!context.session?.itemId) {
    throw new Error("Not authenticated");
  }

  try {
    // Create store and currencies
    const { store, currencies } = seedData;
    const { data: { createStore } } = await context.graphql.raw({
      query: `mutation CreateStore($data: StoreCreateInput!) {
        createStore(data: $data) {
          id
        }
      }`,
      variables: {
        data: { ...store, currencies: { create: currencies } }
      }
    });
    console.log(`Store created with ID: ${createStore.id}`);

    // Create payment providers
    const providerMap = new Map();
    for (const provider of seedData.paymentProviders) {
      const { data: { createPaymentProvider } } = await context.graphql.raw({
        query: `mutation CreatePaymentProvider($data: PaymentProviderCreateInput!) {
          createPaymentProvider(data: $data) {
            id
            code
          }
        }`,
        variables: {
          data: provider
        }
      });
      providerMap.set(provider.code, createPaymentProvider.id);
    }

    // Create fulfillment provider
    const { data: { createFulfillmentProvider } } = await context.graphql.raw({
      query: `mutation CreateFulfillmentProvider($data: FulfillmentProviderCreateInput!) {
        createFulfillmentProvider(data: $data) {
          id
        }
      }`,
      variables: {
        data: { code: "manual" }
      }
    });

    // Create countries
    for (const country of seedData.countries) {
      await context.graphql.raw({
        query: `mutation CreateCountry($data: CountryCreateInput!) {
          createCountry(data: $data) {
            id
          }
        }`,
        variables: {
          data: country
        }
      });
    }

    // Create regions
    const createdRegions = [];
    for (const region of seedData.regions) {
      const {
        id,
        currency_code,
        countries,
        fulfillment_providers,
        payment_providers,
        tax_rate,
        name,
      } = region;

      const { data: { createRegion } } = await context.graphql.raw({
        query: `mutation CreateRegion($data: RegionCreateInput!) {
          createRegion(data: $data) {
            id
          }
        }`,
        variables: {
          data: {
            name,
            code: id,
            taxRate: tax_rate,
            currency: { connect: { code: currency_code } },
            paymentProviders: {
              connect: payment_providers.map((code) => ({ id: providerMap.get(code) })),
            },
            fulfillmentProviders: {
              connect: fulfillment_providers.map((code) => ({ code })),
            },
            countries: {
              connect: countries.map((iso2) => ({ iso2 })),
            },
          }
        }
      });
      createdRegions.push({ id: createRegion.id });
    }

    // Create shipping options
    for (const option of seedData.shipping_options) {
      const {
        name,
        amount,
        data,
        price_type,
        provider_id,
        region_id,
        is_return,
      } = option;

      await context.graphql.raw({
        query: `mutation CreateShippingOption($data: ShippingOptionCreateInput!) {
          createShippingOption(data: $data) {
            id
          }
        }`,
        variables: {
          data: {
            name,
            priceType: price_type,
            amount,
            data,
            isReturn: is_return !== undefined ? is_return : false,
            region: { connect: { code: region_id } },
            fulfillmentProvider: { connect: { code: provider_id } },
          }
        }
      });
    }

    // Create collections
    const collectionIds = {};
    for (const collection of seedData.collections) {
      const { data: { createProductCollection } } = await context.graphql.raw({
        query: `mutation CreateCollection($data: ProductCollectionCreateInput!) {
          createProductCollection(data: $data) {
            id
          }
        }`,
        variables: {
          data: { 
            title: collection.title, 
            handle: collection.handle 
          }
        }
      });
      collectionIds[collection.handle] = createProductCollection.id;
    }

    // Create categories
    const categoryIds = {};
    for (const category of seedData.categories) {
      const { data: { createProductCategory } } = await context.graphql.raw({
        query: `mutation CreateProductCategory($data: ProductCategoryCreateInput!) {
          createProductCategory(data: $data) {
            id
          }
        }`,
        variables: {
          data: {
            title: category.name, 
            handle: category.id 
          }
        }
      });
      categoryIds[category.handle] = createProductCategory.id;
    }

    // Create products
    for (const product of seedData.products) {
      const {
        title,
        categories,
        subtitle,
        description,
        handle,
        is_giftcard,
        weight,
        options,
        variants,
        collections: productCollections
      } = product;

      // Create product
      const { data: { createProduct } } = await context.graphql.raw({
        query: `mutation CreateProduct($data: ProductCreateInput!) {
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
        }`,
        variables: {
          data: {
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
            productCategories: { 
              connect: categories.map((category) => ({
                handle: category.id,
              }))
            },
            productCollections: {
              connect: productCollections
                ? productCollections.map((collection) => ({
                    id: collectionIds[collection],
                  }))
                : [],
            },
          }
        }
      });

      // Create variants
      const allOptionValues = createProduct.productOptions.reduce((acc, option) => {
        return acc.concat(option.productOptionValues);
      }, []);

      for (const variant of variants) {
        const {
          title,
          prices,
          options,
          inventory_quantity,
          manage_inventory,
        } = variant;

        const optionValues = options.map((option) => option.value);
        const matchingIds = allOptionValues
          .filter((item) => optionValues.includes(item.value))
          .map((item) => ({ id: item.id }));

        await context.graphql.raw({
          query: `mutation createProductVariants($data: [ProductVariantCreateInput!]!) {
            createProductVariants(data: $data) {
              id
            }
          }`,
          variables: {
            data: [{
              title,
              inventoryQuantity: inventory_quantity,
              manageInventory: manage_inventory,
              prices: {
                create: prices.map(({ currency_code, amount }) => {
                  const region = seedData.regions.find(
                    (region) => region.currency_code === currency_code
                  );
                  return {
                    amount,
                    currency: { connect: { code: currency_code } },
                    region: { connect: { code: region?.id } },
                  };
                }),
              },
              productOptionValues: {
                connect: matchingIds,
              },
              product: {
                connect: { id: createProduct.id },
              },
            }]
          }
        });
      }

      // Create product images
      const filename = `${handle}.jpeg`;
      const imagesDir = path.join(process.cwd(), 'storefront', 'lib', 'seed', 'images');
      const imagePath = path.join(imagesDir, filename);

      if (fs.existsSync(imagePath)) {
        const upload = prepareToUpload(imagePath);

        await context.graphql.raw({
          query: `mutation CreateProductImage($data: ProductImageCreateInput!) {
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
          }`,
          variables: {
            data: {
              image: {
                upload
              },
              products: {
                connect: [{ id: createProduct.id }],
              },
            },
          }
        });
      }
    }

    console.log("Database seeding completed successfully!");
    return true;
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

export default seedStorefront; 