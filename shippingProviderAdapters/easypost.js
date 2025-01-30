import EasyPost from "@easypost/api";

export async function createLabelFunction({ provider, order }) {
  const api = new EasyPost(provider.credentials.apiKey);

  const shipment = await api.Shipment.create({
    to_address: {
      name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
      company: order.shippingAddress.company,
      street1: order.shippingAddress.address1,
      street2: order.shippingAddress.address2,
      city: order.shippingAddress.city,
      state: order.shippingAddress.province,
      zip: order.shippingAddress.postalCode,
      country: order.shippingAddress.country.iso2,
      phone: order.shippingAddress.phone,
    },
    from_address: provider.metadata.fromAddress,
    parcel: {
      length: order.metadata.parcelLength || 9,
      width: order.metadata.parcelWidth || 6,
      height: order.metadata.parcelHeight || 2,
      weight: order.metadata.parcelWeight || 10,
    },
  });

  return {
    status: "created",
    data: shipment,
    rate: shipment.selected_rate?.rate,
    trackingNumber: shipment.tracking_code,
    trackingUrl: shipment.tracker.public_url,
    labelUrl: shipment.postage_label.label_url,
  };
}

export async function getRatesFunction({ provider, order }) {
  const api = new EasyPost(provider.credentials.apiKey);

  const shipment = await api.Shipment.create({
    to_address: {
      name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
      company: order.shippingAddress.company,
      street1: order.shippingAddress.address1,
      street2: order.shippingAddress.address2,
      city: order.shippingAddress.city,
      state: order.shippingAddress.province,
      zip: order.shippingAddress.postalCode,
      country: order.shippingAddress.country.iso2,
      phone: order.shippingAddress.phone,
    },
    from_address: provider.metadata.fromAddress,
    parcel: {
      length: order.metadata.parcelLength || 9,
      width: order.metadata.parcelWidth || 6,
      height: order.metadata.parcelHeight || 2,
      weight: order.metadata.parcelWeight || 10,
    },
  });

  return shipment.rates.map(rate => ({
    service: rate.service,
    carrier: rate.carrier,
    rate: rate.rate,
    days: rate.delivery_days,
  }));
}

export async function validateAddressFunction({ provider, address }) {
  const api = new EasyPost(provider.credentials.apiKey);

  try {
    const verifiedAddress = await api.Address.create({
      verify: ['delivery'],
      street1: address.address1,
      street2: address.address2,
      city: address.city,
      state: address.province,
      zip: address.postalCode,
      country: address.country.iso2,
      company: address.company,
      phone: address.phone,
    });

    return {
      isValid: verifiedAddress.verifications.delivery.success,
      suggestedAddress: verifiedAddress.verifications.delivery.success ? {
        address1: verifiedAddress.street1,
        address2: verifiedAddress.street2,
        city: verifiedAddress.city,
        province: verifiedAddress.state,
        postalCode: verifiedAddress.zip,
        country: verifiedAddress.country,
      } : null,
      errors: verifiedAddress.verifications.delivery.errors,
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [error.message],
    };
  }
}

export async function trackShipmentFunction({ provider, trackingNumber }) {
  const api = new EasyPost(provider.credentials.apiKey);

  const tracker = await api.Tracker.create({
    tracking_code: trackingNumber,
  });

  return {
    status: tracker.status,
    estimatedDelivery: tracker.est_delivery_date,
    trackingUrl: tracker.public_url,
    events: tracker.tracking_details.map(event => ({
      status: event.status,
      location: event.tracking_location,
      timestamp: event.datetime,
      message: event.message,
    })),
  };
}

export async function cancelLabelFunction({ provider, labelId }) {
  const api = new EasyPost(provider.credentials.apiKey);

  try {
    await api.Shipment.retrieve(labelId).refund();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
} 