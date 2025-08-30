async function getCustomerAccount(root, { accountId }, context) {
  if (!context.session?.itemId) {
    throw new Error('Not authenticated');
  }

  const sudoContext = context.sudo();
  
  const account = await sudoContext.query.Account.findOne({
    where: { id: accountId },
    query: `
      id
      accountNumber
      title
      description
      status
      totalAmount
      paidAmount
      creditLimit
      formattedTotal
      formattedBalance
      formattedCreditLimit
      availableCredit
      formattedAvailableCredit
      balanceDue
      dueDate
      paidAt
      createdAt
      accountType
      currency {
        id
        code
        symbol
      }
      user {
        id
        email
        name
      }
      orders {
        id
        displayId
        status
        total
        createdAt
        lineItems {
          id
          title
          quantity
          thumbnail
        }
      }
      lineItems {
        id
        description
        amount
        formattedAmount
        orderDisplayId
        itemCount
        paymentStatus
        createdAt
        orderDetails
      }
    `
  });

  if (!account) {
    throw new Error('Account not found');
  }

  // Verify the account belongs to the authenticated user
  if (account.user?.id !== context.session.itemId) {
    throw new Error('Account not found');
  }

  return account;
}

export default getCustomerAccount;