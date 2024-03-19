const { GraphQLClient } = require('graphql-request');
const seedData = require('./seed-data.json');

const endpoint = 'http://localhost:3000/api/graphql';
const client = new GraphQLClient(endpoint);


async function seedDatabase() {
  try {
    // Create currencies
    const currenciesToCreate = seedData.store.currencies;
    for (const currencyCode of currenciesToCreate) {
      const { createCurrency } = await client.request(
        `
          mutation CreateCurrency($data: CurrencyCreateInput!) {
            createCurrency(data: $data) {
              id
            }
          }
        `,
        { data: { code: currencyCode } }
      );
    }

    // Create countries
    const countries = new Set();
    for (const region of seedData.regions) {
      for (const countryCode of region.countries) {
        countries.add(countryCode);
      }
    }

    for (const countryCode of countries) {
      const { createCountry } = await client.request(
        `
          mutation CreateCountry($data: CountryCreateInput!) {
            createCountry(data: $data) {
              id
            }
          }
        `,
        { data: { code: countryCode } }
      );
    }

    // Create tax provider
    const { createTaxProvider } = await client.request(
      `
        mutation CreateTaxProvider($data: TaxProviderCreateInput!) {
          createTaxProvider(data: $data) {
            id
          }
        }
      `,
      { data: { code: 'default', metadata: {} } }
    );

    // Create fulfillment provider
    const { createFulfillmentProvider } = await client.request(
      `
        mutation CreateFulfillmentProvider($data: FulfillmentProviderCreateInput!) {
          createFulfillmentProvider(data: $data) {
            id
          }
        }
      `,
      { data: { code: 'manual', metadata: {} } }
    );

    // Create payment provider
    const { createPaymentProvider } = await client.request(
      `
        mutation CreatePaymentProvider($data: PaymentProviderCreateInput!) {
          createPaymentProvider(data: $data) {
            id
          }
        }
      `,
      { data: { code: 'manual', metadata: {} } }
    );

    // Create a store
    const storeInput = {
      name: 'My Medusa Store',
      defaultCurrencyCode: 'USD',
      metadata: {},
    };
    const { createStore } = await client.request(
      `
        mutation CreateStore($data: StoreCreateInput!) {
          createStore(data: $data) {
            id
          }
        }
      `,
      { data: storeInput }
    );

    // Create regions
    const { regions } = seedData;
    for (const regionData of regions) {
      const { createRegion } = await client.request(
        `
          mutation CreateRegion($data: RegionCreateInput!) {
            createRegion(data: $data) {
              id
            }
          }
        `,
        {
          data: {
            ...regionData,
            taxProvider: { connect: { id: createTaxProvider.id } },
            fulfillmentProviders: {
              connect: [{ id: createFulfillmentProvider.id }],
            },
            paymentProviders: { connect: [{ id: createPaymentProvider.id }] },
          },
        }
      );
    }

    // Create shipping options
    const { shipping_options } = seedData;
    for (const shippingOptionData of shipping_options) {
      const { createShippingOption } = await client.request(
        `
          mutation CreateShippingOption($data: ShippingOptionCreateInput!) {
            createShippingOption(data: $data) {
              id
            }
          }
        `,
        {
          data: {
            ...shippingOptionData,
            fulfillmentProvider: {
              connect: { id: createFulfillmentProvider.id },
            },
          },
        }
      );
    }

    // Create products
    const { products, categories } = seedData;
    for (const productData of products) {
      const categoriesInput = productData.categories.map((category) => ({
        id: category.id,
      }));

      const productInput = {
        ...productData,
        productCategories: { connect: categoriesInput },
      };

      const { createProduct } = await client.request(
        `
          mutation CreateProduct($data: ProductCreateInput!) {
            createProduct(data: $data) {
              id
            }
          }
        `,
        { data: productInput }
      );
    }

    // Create product categories
    for (const categoryData of categories) {
      const { createProductCategory } = await client.request(
        `
          mutation CreateProductCategory($data: ProductCategoryCreateInput!) {
            createProductCategory(data: $data) {
              id
            }
          }
        `,
        { data: categoryData }
      );
    }

    // Create product types
    const { createProductType } = await client.request(
      `
        mutation CreateProductType($data: ProductTypeCreateInput!) {
          createProductType(data: $data) {
            id
          }
        }
      `,
      { data: { value: 'default', metadata: {} } }
    );

    // Create product variants
    for (const product of products) {
      for (const variant of product.variants) {
        const variantInput = {
          ...variant,
          product: { connect: { id: createProduct.id } },
        };

        const { createProductVariant } = await client.request(
          `
            mutation CreateProductVariant($data: ProductVariantCreateInput!) {
              createProductVariant(data: $data) {
                id
              }
            }
          `,
          { data: variantInput }
        );
      }
    }

    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();