"use server";

import { cancelLabel } from "../utils/shippingProviderAdapter";
import { permissions } from "../access";

async function cancelShippingLabel(root, { providerId, labelId }, context) {
  // Check access permissions first
  const hasAccess =
    permissions.canReadOrders({ session: context.session }) ||
    permissions.canManageOrders({ session: context.session });

  if (!hasAccess) {
    throw new Error(
      "Access denied: You do not have permission to cancel shipping labels"
    );
  }

  const provider = await context.db.ShippingProvider.findOne({
    where: { id: providerId },
    query: `
      id
      accessToken
      metadata
      cancelLabelFunction
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

  return cancelLabel({ 
    provider: {
      ...provider,
      accessToken: provider.accessToken
    }, 
    labelId 
  });
}

export default cancelShippingLabel; 