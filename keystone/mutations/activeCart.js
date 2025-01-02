async function activeCart(root, { cartId }, context) {
  if (!cartId) {
    throw new Error("Cart ID is required");
  }

  const sudoContext = context.sudo();

  // Get cart with sudo
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      email
      type
      checkoutStep
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
      subtotal
      total
      discount
      giftCardTotal
      tax
      shipping
      lineItems {
        id
        quantity
        title
        thumbnail
        description
        unitPrice
        originalPrice
        total
        percentageOff
        productVariant {
          id
          title
          product {
            id
            title
            thumbnail
            handle
          }
        }
      }
      giftCards {
        id
        code
        balance
      }
      discountsById
      discounts {
        id
        code
        isDynamic
        isDisabled
        discountRule {
          id
          type
          value
          allocation
        }
      }
      shippingMethods {
        id
        price
        shippingOption {
          id
          name
        }
      }
      paymentCollection {
        id
        status
        paymentSessions {
          id
          status
          data
          isSelected
          paymentProvider {
            id
            code
            isInstalled
          }
        }
      }
      addresses {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        countryCode
        phone
      }
      shippingAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        countryCode
        phone
      }
      billingAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        countryCode
        phone
      }
    `,
  });

  if (!cart) {
    return null;
  }

  return cart;
}

export default activeCart;
