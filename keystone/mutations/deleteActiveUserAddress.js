async function deleteActiveUserAddress(root, { where }, context) {
  const sudoContext = context.sudo();

  // Check if user is authenticated
  const session = context.session;
  if (!session?.itemId) {
    throw new Error("Not authenticated");
  }

  // Get current user with addresses
  const existingUser = await sudoContext.query.User.findOne({
    where: { id: session.itemId },
    query: 'id addresses { id }'
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  // Verify the address belongs to the user
  const addressExists = existingUser.addresses.some(addr => addr.id === where.id);
  if (!addressExists) {
    throw new Error("Address not found");
  }

  // Delete the address
  return await sudoContext.db.Address.deleteOne({
    where: where
  });
}

export default deleteActiveUserAddress; 