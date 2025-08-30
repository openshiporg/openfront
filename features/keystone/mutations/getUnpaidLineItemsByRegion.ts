// Get unpaid account line items grouped by region for payment interface
async function getUnpaidLineItemsByRegion(root, { accountId }, context) {
  const sudoContext = context.sudo();
  
  // Validate user has access to this account
  if (!context.session?.itemId) {
    throw new Error('Authentication required');
  }

  // Get account and verify ownership
  const account = await sudoContext.query.Account.findOne({
    where: { id: accountId },
    query: `
      id
      user {
        id
        email
      }
    `
  });

  if (!account) {
    throw new Error('Account not found');
  }

  if (account.user.id !== context.session.itemId) {
    throw new Error('Unauthorized access to account');
  }

  try {
    // Get all unpaid line items with region information
    const unpaidLineItems = await sudoContext.query.AccountLineItem.findMany({
      where: {
        account: { id: { equals: accountId } },
        paymentStatus: { equals: 'unpaid' }
      },
      query: `
        id
        amount
        description
        orderDisplayId
        itemCount
        createdAt
        region {
          id
          name
          currency {
            id
            code
            symbol
            noDivisionCurrency
          }
        }
      `,
      orderBy: { createdAt: 'desc' }
    });

    // Group line items by region
    const lineItemsByRegion = unpaidLineItems.reduce((acc, item) => {
      const regionId = item.region.id;
      const regionName = item.region.name;
      const currency = item.region.currency;

      if (!acc[regionId]) {
        acc[regionId] = {
          region: {
            id: regionId,
            name: regionName,
            currency: currency
          },
          lineItems: [],
          totalAmount: 0,
          itemCount: 0
        };
      }

      acc[regionId].lineItems.push({
        id: item.id,
        amount: item.amount,
        description: item.description,
        orderDisplayId: item.orderDisplayId,
        itemCount: item.itemCount,
        createdAt: item.createdAt,
        formattedAmount: formatCurrencyAmount(item.amount, currency.code)
      });

      acc[regionId].totalAmount += (item.amount || 0);
      acc[regionId].itemCount += (item.itemCount || 0);

      return acc;
    }, {});

    // Convert to array and add formatted totals
    const regionsWithLineItems = Object.values(lineItemsByRegion).map(regionData => ({
      ...regionData,
      formattedTotalAmount: formatCurrencyAmount(
        regionData.totalAmount, 
        regionData.region.currency.code
      )
    }));

    // Sort regions by total amount descending
    regionsWithLineItems.sort((a, b) => b.totalAmount - a.totalAmount);

    return {
      success: true,
      regions: regionsWithLineItems,
      totalRegions: regionsWithLineItems.length,
      totalUnpaidItems: unpaidLineItems.length,
      message: `Found ${unpaidLineItems.length} unpaid orders across ${regionsWithLineItems.length} regions`
    };

  } catch (error) {
    console.error('Error getting unpaid line items by region:', error);
    throw new Error(`Failed to get unpaid line items: ${error.message}`);
  }
}

// Helper function to format currency amounts
function formatCurrencyAmount(amount: number, currencyCode: string): string {
  const currency = currencyCode.toUpperCase();
  
  // Handle no-division currencies (JPY, KRW, etc.)
  const noDivisionCurrencies = ['JPY', 'KRW', 'VND'];
  const divisor = noDivisionCurrencies.includes(currency) ? 1 : 100;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount / divisor);
}

export default getUnpaidLineItemsByRegion;