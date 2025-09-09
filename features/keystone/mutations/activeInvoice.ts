async function activeInvoice(root, { invoiceId }, context) {
  if (!invoiceId) {
    throw new Error("Invoice ID is required");
  }

  const sudoContext = context.sudo();

  // Get invoice with sudo
  const invoice = await sudoContext.query.Invoice.findOne({
    where: { id: invoiceId },
    query: `
      id
      invoiceNumber
      status
      totalAmount
      currency {
        code
        noDivisionCurrency
      }
      account {
        id
        user {
          id
        }
      }
      lineItems {
        id
        accountLineItem {
          id
          description
          orderDisplayId
          itemCount
          formattedAmount
          createdAt
          order {
            id
            displayId
            createdAt
            total
          }
          region {
            id
            name
            countries {
              id
              name
              iso2
              region {
                id
              }
            }
            currency {
              code
              noDivisionCurrency
            }
            taxRate
          }
        }
      }
      paymentCollection {
        id
        paymentSessions {
          id
          data
          isSelected
          paymentProvider {
            id
            code
            isInstalled
          }
        }
      }
    `,
  });

  if (!invoice) {
    return null;
  }

  return invoice;
}

export default activeInvoice;