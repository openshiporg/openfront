async function updateActiveUserAddress(root, { where, data }, context) {
  const sudoContext = context.sudo();

  // Check if user is authenticated
  const session = context.session;
  if (!session?.itemId) {
    throw new Error("Not authenticated");
  }

  // Get current user with addresses
  const existingUser = await sudoContext.query.User.findOne({
    where: { id: session.itemId },
    query: "id addresses { id isBilling }",
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  // Verify the address belongs to the user
  const addressExists = existingUser.addresses.some(
    (addr) => addr.id === where.id
  );

  if (!addressExists) {
    throw new Error("Address not found");
  }

  // If this is a new billing address, update any existing billing addresses
  if (data.isBilling && existingUser.addresses) {
    for (const addr of existingUser.addresses) {
      if (addr.isBilling && addr.id !== where.id) {
        await sudoContext.db.Address.updateOne({
          where: { id: addr.id },
          data: { isBilling: false },
        });
      }
    }
  }

  // Update the address directly
  return await sudoContext.db.Address.updateOne({
    where,
    data,
  });
}

export default updateActiveUserAddress;
