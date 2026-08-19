async function getCustomerPaidInvoices(
  root: any,
  { limit = 10, offset = 0 }: { limit?: number; offset?: number },
  context: any
) {
  if (!context.session?.itemId) {
    throw new Error('Not authenticated');
  }

  const boundedLimit = Math.max(1, Math.min(Number(limit) || 10, 100));
  const boundedOffset = Math.max(0, Number(offset) || 0);
  const sudoContext = context.sudo();
  
  const invoices = await sudoContext.query.Invoice.findMany({
    where: { 
      account: { 
        user: { id: { equals: context.session.itemId } } 
      },
      status: { equals: 'paid' }
    },
    orderBy: { paidAt: 'desc' },
    take: boundedLimit,
    skip: boundedOffset,
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