async function setInvoicePaymentSession(root, { invoiceId, providerId }, context) {
  const sudoContext = context.sudo();

  // Get invoice with payment collection
  const invoice = await sudoContext.query.Invoice.findOne({
    where: { id: invoiceId },
    query: `
      id
      paymentCollection {
        id
        paymentSessions {
          id
          paymentProvider {
            id
          }
        }
      }
    `
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  if (!invoice.paymentCollection) {
    throw new Error("Invoice has no payment collection");
  }

  // Update all payment sessions to not selected
  for (const session of invoice.paymentCollection.paymentSessions || []) {
    await sudoContext.db.PaymentSession.updateOne({
      where: { id: session.id },
      data: { isSelected: false }
    });
  }

  // Find and update the selected session
  const selectedSession = invoice.paymentCollection.paymentSessions?.find(
    s => s.paymentProvider.id === providerId
  );

  if (!selectedSession) {
    throw new Error("Payment session not found");
  }

  await sudoContext.db.PaymentSession.updateOne({
    where: { id: selectedSession.id },
    data: { isSelected: true }
  });

  return await sudoContext.db.Invoice.findOne({
    where: { id: invoiceId }
  });
}

export default setInvoicePaymentSession;