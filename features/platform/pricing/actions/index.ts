'use server';

// Re-export all pricing-related actions
export * from './discount-actions';
export * from './gift-card-actions';
export * from './price-list-actions';

// Consolidated status counts for all pricing entities
export async function getAllPricingStatusCounts() {
  const { getDiscountStatusCounts } = await import('./discount-actions');
  const { getGiftCardStatusCounts } = await import('./gift-card-actions');
  const { getPriceListStatusCounts } = await import('./price-list-actions');

  try {
    const [discountCounts, giftCardCounts, priceListCounts] = await Promise.all([
      getDiscountStatusCounts(),
      getGiftCardStatusCounts(),
      getPriceListStatusCounts(),
    ]);

    return {
      success: true,
      data: {
        discounts: discountCounts.success ? discountCounts.data : { all: 0, active: 0, disabled: 0 },
        giftCards: giftCardCounts.success ? giftCardCounts.data : { all: 0, active: 0, depleted: 0, disabled: 0 },
        priceLists: priceListCounts.success ? priceListCounts.data : { all: 0, active: 0, draft: 0, scheduled: 0, expired: 0 },
      },
    };
  } catch (error: any) {
    console.error('Error fetching all pricing status counts:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch pricing status counts',
      data: {
        discounts: { all: 0, active: 0, disabled: 0 },
        giftCards: { all: 0, active: 0, depleted: 0, disabled: 0 },
        priceLists: { all: 0, active: 0, draft: 0, scheduled: 0, expired: 0 },
      },
    };
  }
}