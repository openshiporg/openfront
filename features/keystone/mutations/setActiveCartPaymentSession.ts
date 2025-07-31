async function setActiveCartPaymentSession(root, { cartId, providerId }, context) {
  const sudoContext = context.sudo();

  // Get cart with payment collection
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      paymentCollection {
        id
        paymentSessions {
          id
          paymentProvider {
            id
          }
        }
      }
    `
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  if (!cart.paymentCollection) {
    throw new Error("Cart has no payment collection");
  }

  // Update all payment sessions to not selected
  for (const session of cart.paymentCollection.paymentSessions || []) {
    await sudoContext.db.PaymentSession.updateOne({
      where: { id: session.id },
      data: { isSelected: false }
    });
  }

  // Find and update the selected session
  const selectedSession = cart.paymentCollection.paymentSessions?.find(
    s => s.paymentProvider.id === providerId
  );

  if (!selectedSession) {
    throw new Error("Payment session not found");
  }

  await sudoContext.db.PaymentSession.updateOne({
    where: { id: selectedSession.id },
    data: { isSelected: true }
  });

  return await sudoContext.db.Cart.findOne({
    where: { id: cartId }
  });
}

export default setActiveCartPaymentSession; 