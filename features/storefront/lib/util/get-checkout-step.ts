interface Cart {
  shipping_address?: {
    address_1: string;
  };
  email?: string;
  shipping_methods: any[];
}

export function getCheckoutStep(
  cart: Cart
) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}
