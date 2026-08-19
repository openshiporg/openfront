import {
  assertAddressAccess,
  assertCartAccess,
  assertLineItemBelongsToCart,
} from "../security/cart-access";

async function updateActiveCart(
  root: any,
  { cartId, data }: { cartId: string; data: any },
  context: any
) {
  await assertCartAccess(context, cartId);
  const sudoContext = context.sudo();

  // First verify this cart exists
  const existingCart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      lineItems {
        id
        quantity
        productVariant {
          id
        }
      }
    `
  });

  if (!existingCart) {
    throw new Error("Cart not found");
  }
  if (data?.region && existingCart.lineItems?.length) {
    throw new Error("Region cannot change after items are added; start a new cart");
  }

  // Ownership, payment collection, order linkage, and cart identity are server-owned.
  if (data) {
    delete data.user;
    delete data.order;
    delete data.paymentCollection;
    delete data.payment;
    delete data.idempotencyKey;
    if (data.metadata || data.context) {
      throw new Error("Cart tax and commercial context are server-owned");
    }
    if (data.giftCards) {
      throw new Error("Gift-card redemption is outside the bounded launch boundary");
    }
    if (
      data.email !== undefined ||
      data.region ||
      data.shippingAddress ||
      data.billingAddress ||
      data.lineItems ||
      data.discounts
    ) {
      data.paymentCollection = { disconnect: true };
    }
  }

  for (const relation of [data?.shippingAddress, data?.billingAddress]) {
    const addressId = relation?.connect?.id;
    if (addressId) await assertAddressAccess(context, addressId);
    if (relation?.connect && !addressId) throw new Error("Address ID is required");
  }

  const existingLineItemIds = [
    ...(data?.lineItems?.disconnect || []),
    ...(data?.lineItems?.delete || []),
    ...(data?.lineItems?.update || []).map((entry: any) => entry.where),
  ]
    .map((entry) => entry?.id)
    .filter(Boolean);
  for (const lineItemId of existingLineItemIds) {
    await assertLineItemBelongsToCart(context, cartId, lineItemId);
  }

  // Existing line items may only be changed through their validated parent cart.
  if (data?.lineItems?.connect || data?.lineItems?.set) {
    throw new Error("Existing line items cannot be attached to a cart");
  }

  for (const entry of data?.lineItems?.update || []) {
    if (
      entry.data?.quantity !== undefined &&
      (!Number.isInteger(entry.data.quantity) || entry.data.quantity <= 0)
    ) {
      throw new Error("Line item quantity must be a positive integer");
    }
  }

  // Handle duplicate line items if we're adding new ones
  if (data?.lineItems?.create?.length) {
    for (const newItem of data.lineItems.create) {
      if (
        !newItem.productVariant?.connect?.id ||
        !Number.isInteger(newItem.quantity) ||
        newItem.quantity <= 0
      ) {
        throw new Error("A variant and positive integer quantity are required");
      }
      const variantId = newItem.productVariant.connect.id;
      const existingLineItem = existingCart.lineItems?.find(
        (item: any) => item.productVariant.id === variantId
      );

      if (existingLineItem) {
        // Update existing line item using graphql.raw
        await context.graphql.raw({
          query: `
            mutation UpdateActiveCartLineItem($cartId: ID!, $lineId: ID!, $quantity: Int!) {
              updateActiveCartLineItem(cartId: $cartId, lineId: $lineId, quantity: $quantity) {
                id
              }
            }
          `,
          variables: {
            cartId,
            lineId: existingLineItem.id,
            quantity: existingLineItem.quantity + newItem.quantity
          }
        });
        // Remove the create operation since we handled it
        delete data.lineItems;
      }
    }
  }

  // Update cart with modified data
  return await sudoContext.db.Cart.updateOne({
    where: { id: cartId },
    data,
  });
}

export default updateActiveCart;

