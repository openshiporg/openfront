async function getCustomerPaidInvoices(root, { limit = 10, offset = 0 }, context) {
  if (!context.session?.itemId) {
    throw new Error('Not authenticated');
  }

  const sudoContext = context.sudo();
  
  const invoices = await sudoContext.query.Invoice.findMany({
    where: { 
      account: { 
        user: { id: { equals: context.session.itemId } } 
      },
      status: { equals: 'paid' }
    },
    orderBy: { paidAt: 'desc' },
    take: limit,
    skip: offset,
    query: `
      id
      invoiceNumber
      totalAmount
      status
      paidAt
      dueDate
      createdAt
      currency {
        id
        code
        symbol
        noDivisionCurrency
      }
      account {
        id
        accountNumber
        title
      }
      formattedTotal
      lineItems {
        id
        orderDisplayId
        formattedAmount
        orderDetails
        accountLineItem {
          id
          orderDisplayId
          itemCount
          paymentStatus
          description
          amount
          order {
            id
            displayId
          }
        }
      }
    `
  });

  return invoices;
}

export default getCustomerPaidInvoices;