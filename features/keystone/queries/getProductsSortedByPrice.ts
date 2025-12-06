interface GetProductsSortedByPriceArgs {
  countryCode: string;
  limit: number;
  offset: number;
  priceOrder: string;
  collectionId?: string;
  categoryId?: string;
}

export default async function getProductsSortedByPrice(
  root: any,
  { countryCode, limit, offset, priceOrder, collectionId, categoryId }: GetProductsSortedByPriceArgs,
  context: any
) {
  const prisma = context.prisma;

  // Build the base where clause for products
  const productWhere: any = {
    status: 'published',
    productVariants: {
      some: {
        prices: {
          some: {
            region: {
              countries: {
                some: {
                  iso2: countryCode
                }
              }
            }
          }
        }
      }
    }
  };

  // Add collection filter
  if (collectionId) {
    productWhere.productCollections = {
      some: { id: collectionId }
    };
  }

  // Add category filter
  if (categoryId) {
    productWhere.productCategories = {
      some: { id: categoryId }
    };
  }

  // Get the region ID for this country code
  const region = await prisma.region.findFirst({
    where: {
      countries: {
        some: { iso2: countryCode }
      }
    },
    select: { id: true }
  });

  if (!region) {
    return {
      products: [],
      count: 0
    };
  }

  // Use raw SQL to properly sort products by their minimum variant price
  // This query:
  // 1. Joins products with variants and prices
  // 2. Filters by region
  // 3. Groups by product and gets the min price
  // 4. Orders by that min price
  const orderDirection = priceOrder === 'asc' ? 'ASC' : 'DESC';

  // Build dynamic WHERE conditions
  let whereConditions = `p."status" = 'published'`;

  if (collectionId) {
    whereConditions += ` AND EXISTS (
      SELECT 1 FROM "_Product_productCollections" ptpc
      WHERE ptpc."A" = p."id" AND ptpc."B" = '${collectionId}'
    )`;
  }

  if (categoryId) {
    whereConditions += ` AND EXISTS (
      SELECT 1 FROM "_Product_productCategories" ptpc
      WHERE ptpc."A" = p."id" AND ptpc."B" = '${categoryId}'
    )`;
  }

  // Query to get product IDs sorted by min price
  const sqlQuery = `
    SELECT p."id", MIN(ma."amount") as min_price
    FROM "Product" p
    INNER JOIN "ProductVariant" pv ON pv."product" = p."id"
    INNER JOIN "MoneyAmount" ma ON ma."productVariant" = pv."id"
    WHERE ma."region" = '${region.id}'
      AND ${whereConditions}
    GROUP BY p."id"
    ORDER BY min_price ${orderDirection}
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  const rawResult = await prisma.$queryRawUnsafe(sqlQuery);

  // Ensure we have an array
  const sortedProductIds: { id: string; min_price: number }[] = Array.isArray(rawResult) ? rawResult : [];

  // Get total count
  const countRaw = await prisma.$queryRawUnsafe(`
    SELECT COUNT(DISTINCT p."id") as count
    FROM "Product" p
    INNER JOIN "ProductVariant" pv ON pv."product" = p."id"
    INNER JOIN "MoneyAmount" ma ON ma."productVariant" = pv."id"
    WHERE ma."region" = '${region.id}'
      AND ${whereConditions}
  `);

  const countResult: { count: bigint }[] = Array.isArray(countRaw) ? countRaw : [];
  const totalCount = Number(countResult[0]?.count || 0);

  if (sortedProductIds.length === 0) {
    return {
      products: [],
      count: totalCount
    };
  }

  // Fetch full product data for these IDs
  const productIds = sortedProductIds.map((p: { id: string }) => p.id);

  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds }
    },
    include: {
      productVariants: {
        include: {
          prices: {
            where: {
              region: {
                countries: {
                  some: { iso2: countryCode }
                }
              }
            },
            include: {
              currency: true
            }
          }
        }
      }
    }
  });

  // Sort products to match the order from our raw query
  const productMap = new Map(products.map((p: any) => [p.id, p]));
  const sortedProducts = productIds.map((id: string) => productMap.get(id)).filter(Boolean);

  return {
    products: sortedProducts,
    count: totalCount
  };
}
