import { assertCartAccess } from "../security/cart-access";

async function addActiveCartShippingMethod(
  root: any,
  { cartId, shippingMethodId }: { cartId: string; shippingMethodId: string },
  context: any
) {
  await assertCartAccess(context, cartId);
  const sudo = context.sudo();
  const cart = await sudo.query.Cart.findOne({
    where: { id: cartId },
    query: "id region { id }",
  });
  const option = await sudo.query.ShippingOption.findOne({
    where: { id: shippingMethodId },
    query: "id amount name region { id } adminOnly isReturn",
  });
  if (
    !cart ||
    !option ||
    option.region?.id !== cart.region?.id ||
    option.adminOnly ||
    option.isReturn
  ) {
    throw new Error("Shipping option not found");
  }

  await sudo.prisma.$transaction(async (tx: any) => {
    await tx.shippingMethod.deleteMany({ where: { cartId } });
    await tx.shippingMethod.create({
      data: {
        cartId,
        shippingOptionId: option.id,
        price: option.amount,
        data: { name: option.name },
      },
    });
    await tx.cart.update({
      where: { id: cartId },
      data: { paymentCollectionId: null },
    });
  });

  return sudo.query.Cart.findOne({
    where: { id: cartId },
    query: "id shippingMethods { id price data shippingOption { id name } }",
  });
}

export default addActiveCartShippingMethod;
