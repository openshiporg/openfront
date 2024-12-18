async function activeCartPaymentProviders(root, { regionId }, context) {
  if (!regionId) {
    throw new Error('Region ID is required');
  }

  const providers = await context.sudo().query.PaymentProvider.findMany({
    where: {
      isInstalled: { equals: true },
      regions: { some: { id: { equals: regionId } } }
    },
    query: `
      id
      name
      code
      isInstalled
    `
  });

  return providers;
}

export default activeCartPaymentProviders; 