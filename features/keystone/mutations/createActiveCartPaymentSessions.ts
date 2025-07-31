async function createActiveCartPaymentSessions(root, { cartId }, context) {
  const sudoContext = context.sudo();

  // Get cart with payment provider info
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      region {
        id
        paymentProviders {
          id
          code
          isInstalled
        }
      }
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

  // Get available payment providers from region
  const availableProviders = cart.region?.paymentProviders?.filter(p => p.isInstalled) || [];

  // Create payment collection if it doesn't exist
  let paymentCollection = cart.paymentCollection;
  if (!paymentCollection) {
    paymentCollection = await sudoContext.db.PaymentCollection.createOne({
      data: {
        cart: { connect: { id: cartId } },
        description: "default",
        amount: 0, // Will be updated when payment is initiated
      },
      query: "id"
    });
  }

  // Create payment sessions for each available provider
  for (const provider of availableProviders) {
    // Skip if session already exists for this provider
    const existingSession = cart.paymentCollection?.paymentSessions?.find(
      s => s.paymentProvider.id === provider.id
    );
    
    if (!existingSession) {
      await sudoContext.db.PaymentSession.createOne({
        data: {
          paymentCollection: { connect: { id: paymentCollection.id } },
          paymentProvider: { connect: { id: provider.id } },
          amount: 0, // Initialize with 0, will be updated when payment is initiated
          data: {}, // Initialize with empty data object
          isSelected: false,
          isInitiated: false,
        }
      });
    }
  }

  // Return updated cart
  return await sudoContext.db.Cart.findOne({
    where: { id: cartId }
  });
}

export default createActiveCartPaymentSessions; 