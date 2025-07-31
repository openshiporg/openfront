import type { KeystoneContext } from '@/features/keystone/types/context'; // Assuming this path is correct
import type { GraphQLResolveInfo } from 'graphql';

// Define args structure if simple
interface ActiveCartPaymentProvidersArgs {
    regionId: string;
}

async function activeCartPaymentProviders(
    root: any,
    { regionId }: ActiveCartPaymentProvidersArgs, // Typed args
    context: KeystoneContext, // Typed context
    info?: GraphQLResolveInfo // Optional info
): Promise<readonly any[]> { // Basic Promise<readonly any[]> return type
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