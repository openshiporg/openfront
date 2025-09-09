async function getCustomerAccounts(root, { limit = 10, offset = 0 }, context) {
  if (!context.session?.itemId) {
    throw new Error('Not authenticated');
  }

  const sudoContext = context.sudo();
  
  const accounts = await sudoContext.query.Account.findMany({
    where: { 
      user: { id: { equals: context.session.itemId } }
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    query: `
      id
      accountNumber
      title
      status
      totalAmount
      paidAmount
      creditLimit
      formattedTotal
      formattedCreditLimit
      availableCredit
      totalOwedInAccountCurrency
      formattedTotalOwedInAccountCurrency
      availableCreditInAccountCurrency
      formattedAvailableCreditInAccountCurrency
      balanceDue
      dueDate
      createdAt
      accountType
      currency {
        id
        code
        symbol
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
        order {
          id
        }
      }
      unpaidLineItemsByRegion
    `
  });

  return accounts;
}

export default getCustomerAccounts;