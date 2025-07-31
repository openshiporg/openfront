async function activeCartShippingOptions(root, { cartId }, context) {
  const sudoContext = context.sudo();

  // Get cart with region and shipping address
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      region {
        id
        currency {
          code
          noDivisionCurrency
        }
      }
      shippingAddress {
        id
      }
      subtotal
    `
  });

  if (!cart?.region?.id) return [];

  // Get shipping options based on region
  const shippingOptions = await sudoContext.query.ShippingOption.findMany({
    where: {
      AND: [
        { region: { id: { equals: cart.region.id } } },
        { isReturn: { equals: false } },
        { adminOnly: { equals: false } }
      ]
    },
    query: `
      id
      name
      amount
      priceType
      data
      shippingOptionRequirements {
        id
        type
        amount
      }
      taxRates {
        id
        rate
      }
    `
  });

  // Format prices and return
  const currencyCode = cart.region?.currency?.code || "USD";
  const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;

  return shippingOptions.map(option => {
    const taxRate = option.taxRates?.[0]?.rate || 0;
    const baseAmount = option.amount;
    const calculatedAmount = baseAmount * (1 + taxRate);

    return {
      ...option,
      amount: baseAmount,
      calculatedAmount: formatAmount(calculatedAmount / divisor, currencyCode),
      isTaxInclusive: true
    };
  });
}

function formatAmount(amount, currencyCode) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode
  }).format(amount);
}

export default activeCartShippingOptions; 