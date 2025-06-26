"use server";

import { validateAddress } from "../utils/shippingProviderAdapter";
import { permissions } from "../access";

async function validateShippingAddress(root, { providerId, address }, context) {
  // Check access permissions first
  const hasAccess =
    permissions.canReadOrders({ session: context.session }) ||
    permissions.canManageOrders({ session: context.session });

  if (!hasAccess) {
    throw new Error(
      "Access denied: You do not have permission to validate shipping addresses"
    );
  }

  const provider = await context.db.ShippingProvider.findOne({
    where: { id: providerId },
    query: `
      id
      accessToken
      metadata
      validateAddressFunction
      isActive
    `,
  });
  if (!provider) throw new Error('Provider not found');

  if (!provider.isActive) {
    throw new Error(`Shipping provider ${provider.id} is not active`);
  }

  if (!provider.accessToken) {
    throw new Error(`Shipping provider ${provider.id} has no access token configured`);
  }

  return validateAddress({ 
    provider: {
      ...provider,
      accessToken: provider.accessToken
    }, 
    address 
  });
}

export default validateShippingAddress; 