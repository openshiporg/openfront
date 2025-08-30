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

    // Generate new secure token
    const crypto = require('crypto');
    const newToken = 'ctok_' + crypto.randomBytes(32).toString('hex');

    // Update user with new token
    await sudoContext.query.User.updateOne({
      where: { id: userId },
      data: {
        customerToken: newToken,
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