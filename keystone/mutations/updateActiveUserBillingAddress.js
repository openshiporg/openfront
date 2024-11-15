async function updateActiveUserBillingAddress(root, { address }, context) {
  const sudoContext = context.sudo();

  // Check if user is authenticated
  const session = context.session;
  if (!session?.itemId) {
    throw new Error("Not authenticated");
  }

  // Get current user with addresses
  const existingUser = await sudoContext.query.User.findOne({
    where: { id: session.itemId },
    query: 'id addresses { id metadata }'
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  // Create billing address data
  const billingAddress = {
    firstName: address.firstName,
    lastName: address.lastName,
    company: address.company,
    address1: address.address1,
    address2: address.address2,
    city: address.city,
    province: address.province,
    postalCode: address.postalCode,
    countryCode: address.countryCode,
    phone: address.phone,
    metadata: { isBilling: true }
  };

  // First, update any existing billing addresses to not be billing
  if (existingUser.addresses) {
    for (const addr of existingUser.addresses) {
      if (addr.metadata?.isBilling) {
        await sudoContext.db.Address.updateOne({
          where: { id: addr.id },
          data: {
            metadata: { isBilling: false }
          }
        });
      }
    }
  }

  // Then create or update the new billing address
  return await sudoContext.db.User.updateOne({
    where: { id: session.itemId },
    data: {
      addresses: {
        create: [billingAddress]
      }
    }
  });
}

export default updateActiveUserBillingAddress; 