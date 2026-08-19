import {
  customerTokenDigest,
  generateOpaqueToken,
} from "../security/token-crypto";

async function regenerateCustomerToken(root, args, context) {
  const userId = context.session?.itemId;
  
  if (!userId) {
    throw new Error('Authentication required');
  }

  const sudoContext = context.sudo();

  try {
    // Check if user has an active business account
    const accounts = await sudoContext.query.Account.findMany({
      where: { 
        user: { id: { equals: userId } },
        status: { equals: 'active' },
        accountType: { equals: 'business' }
      },
      query: 'id'
    });
    
    const activeAccount = accounts[0];

    if (!activeAccount) {
      throw new Error('No active account found. Customer token can only be regenerated for users with active accounts.');
    }

    // Generate once, store only a keyed digest, and return the raw token once.
    const newToken = generateOpaqueToken('ctok_');

    // Update user with new token
    await sudoContext.query.User.updateOne({
      where: { id: userId },
      data: {
        customerToken: customerTokenDigest(newToken),
        tokenGeneratedAt: new Date().toISOString()
      }
    });

    return {
      success: true,
      token: newToken
    };

  } catch (error) {
    console.error('Error regenerating customer token:', error);
    throw error;
  }
}

export default regenerateCustomerToken;