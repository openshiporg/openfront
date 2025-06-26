async function createActiveUserAddress(root, { data }, context) {
  const sudoContext = context.sudo();

  // Check if user is authenticated
  const session = context.session;
  if (!session?.itemId) {
    throw new Error("Not authenticated");
  }

  // Get current user with addresses
  const existingUser = await sudoContext.query.User.findOne({
    where: { id: session.itemId },
    query: 'id addresses { id isBilling }'
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  // If this is a new billing address, update any existing billing addresses
  if (data.isBilling && existingUser.addresses) {
    for (const addr of existingUser.addresses) {
      if (addr.isBilling) {
        await sudoContext.db.Address.updateOne({
          where: { id: addr.id },
          data: { isBilling: false }
        });
      }
    }
  }

  // Create new address
  return await sudoContext.db.User.updateOne({
    where: { id: session.itemId },
    data: {
      addresses: {
        create: [data]
      }
    }
  });
}

export default createActiveUserAddress; 