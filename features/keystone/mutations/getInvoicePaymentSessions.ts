async function getInvoicePaymentSessions(root, { invoiceId }, context) {
  const sudoContext = context.sudo();
  
  try {
    // Find payment collection for this invoice
    const paymentCollection = await sudoContext.query.PaymentCollection.findOne({
      where: { invoice: { id: { equals: invoiceId } } },
      query: `
        id
        paymentSessions {
          id
          amount
          data
          isSelected
          isInitiated
          paymentProvider {
            id
            code
          }
        }
      `
    });
    
    if (!paymentCollection) {
      return [];
    }
    
    return paymentCollection.paymentSessions || [];
  } catch (error) {
    console.error('Error getting invoice payment sessions:', error);
    return [];
  }
}

export default getInvoicePaymentSessions;