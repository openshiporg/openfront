const SHIPENGINE_API_URL = "https://api.shipengine.com/v1";

// Mapping of abbreviated weight units to ShipEngine expected full names
const WEIGHT_UNIT_MAP = {
  oz: "ounce",
  lb: "pound",
  lbs: "pound",
  kg: "kilogram",
  g: "gram",
};

// Mapping of abbreviated dimension units to ShipEngine expected full names (ShipEngine only supports "inch" and "centimeter" for dimensions)
const DIMENSION_UNIT_MAP = {
  in: "inch",
  cm: "centimeter",
};

// Helper function to convert dimensions
// If the dimension unit is 'm', convert to centimeters; if 'ft', convert to inches; otherwise, map using DIMENSION_UNIT_MAP
function convertDimensions(dim) {
  if (dim.unit === "m") {
    return {
      length: dim.length * 100,
      width: dim.width * 100,
      height: dim.height * 100,
      unit: "centimeter",
    };
  } else if (dim.unit === "ft") {
    return {
      length: dim.length * 12,
      width: dim.width * 12,
      height: dim.height * 12,
      unit: "inch",
    };
  } else {
    return {
      length: dim.length,
      width: dim.width,
      height: dim.height,
      unit: DIMENSION_UNIT_MAP[dim.unit] || dim.unit,
    };
  }
}

// Helper function to convert weight
// If the weight unit is already one of the allowed ones, map it. If it's 'mg', convert to grams.
function convertWeight(dim) {
  if (dim.weightUnit in WEIGHT_UNIT_MAP) {
    return {
      value: dim.weight,
      unit: WEIGHT_UNIT_MAP[dim.weightUnit],
    };
  } else if (dim.weightUnit === "mg") {
    return {
      value: dim.weight / 1000,
      unit: "gram",
    };
  } else {
    // Fallback: assume the weight is in grams if not recognized
    return {
      value: dim.weight,
      unit: "gram",
    };
  }
}

// Helper function to list carriers from ShipEngine
export async function listCarriersFunction(provider) {
  const response = await fetch(`${SHIPENGINE_API_URL}/carriers`, {
    method: "GET",
    headers: {
      "API-Key": provider.accessToken,
      "Content-Type": "application/json",
    },
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to list carriers");
  }
  if (!result.carriers || result.carriers.length === 0) {
    throw new Error("No carriers found from ShipEngine");
  }
  return result.carriers;
}

// Creates a shipping label using ShipEngine
export async function createLabelFunction({
  provider,
  order,
  rateId,
  dimensions,
  lineItems,
}) {

  if (!dimensions) {
    throw new Error("Dimensions are required to create a shipping label");
  }

  if (
    !dimensions.length ||
    !dimensions.width ||
    !dimensions.height ||
    !dimensions.weight
  ) {
    throw new Error(
      "Invalid dimensions provided. All dimensions and weight are required"
    );
  }

  // Convert dimensions and weight to ShipEngine expected formats
  const convertedDimensions = convertDimensions(dimensions);
  const convertedWeight = convertWeight(dimensions);

  let serviceCode = rateId;
  let finalRateId = rateId;
  try {
    const parsed = JSON.parse(rateId);
    serviceCode = parsed.service;
    finalRateId = parsed.id;
  } catch (e) {
    // rateId is not JSON, use it as is
  }

  // Build shipment payload for ShipEngine label creation
  const payload = {
    shipment: {
      // Use the serviceCode variable instead of rateId directly
      service_code: serviceCode,
      ship_to: {
        name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        address_line1: order.shippingAddress.address1,
        address_line2: order.shippingAddress.address2,
        city_locality: order.shippingAddress.city,
        state_province: order.shippingAddress.province,
        postal_code: order.shippingAddress.postalCode,
        country_code: order.shippingAddress.country.iso2,
        phone: order.shippingAddress.phone,
        email: order.shippingAddress.email,
      },
      ship_from: {
        name: `${provider.fromAddress.firstName} ${provider.fromAddress.lastName}`,
        address_line1: provider.fromAddress.address1,
        address_line2: provider.fromAddress.address2,
        city_locality: provider.fromAddress.city,
        state_province: provider.fromAddress.province,
        postal_code: provider.fromAddress.postalCode,
        country_code: provider.fromAddress.country.iso2,
        phone: provider.fromAddress.phone,
      },
      packages: [
        {
          weight: convertedWeight,
          dimensions: {
            length: convertedDimensions.length,
            width: convertedDimensions.width,
            height: convertedDimensions.height,
            unit: convertedDimensions.unit,
          },
        },
      ],
    },
    label_format: "PDF",
  };

  const response = await fetch(`${SHIPENGINE_API_URL}/labels`, {
    method: "POST",
    headers: {
      "API-Key": provider.accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to create label");
  }

  // Update to get label URL from label_download
  const labelUrl = result.label_download?.pdf || result.label_download?.href;
  if (!labelUrl) {
    throw new Error("No label URL received from ShipEngine");
  }


  return {
    status: "purchased",
    data: result,
    rate: result.rate,
    carrier: result.carrier_code,
    service: result.service_type || result.service_code,
    trackingNumber: result.tracking_number,
    trackingUrl: result.tracking_url,
    labelUrl: labelUrl,
    rateId: finalRateId,
  };
}

// Gets shipping rates from ShipEngine
export async function getRatesFunction({ provider, order, dimensions }) {
  if (!dimensions) {
    throw new Error("Dimensions are required to get shipping rates");
  }

  // First, call the List Carriers API to retrieve available carriers using your API key.
  // According to the tutorial at [ShipEngine List Carriers](https://www.shipengine.com/docs/reference/list-carriers/),
  // you must include a non-empty array of carrier_ids in the rate_options field.
  const carriers = await listCarriersFunction(provider);
  const carrier_ids = carriers.map((carrier) => carrier.carrier_id);

  // Convert dimensions and weight to ShipEngine formats
  const convertedDimensions = convertDimensions(dimensions);
  const convertedWeight = convertWeight(dimensions);

  // Build the shipment payload including rate_options with the retrieved carrier_ids.
  const payload = {
    shipment: {
      ship_to: {
        name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        address_line1: order.shippingAddress.address1,
        address_line2: order.shippingAddress.address2,
        city_locality: order.shippingAddress.city,
        state_province: order.shippingAddress.province,
        postal_code: order.shippingAddress.postalCode,
        country_code: order.shippingAddress.country.iso2,
        phone: order.shippingAddress.phone,
      },
      ship_from: {
        name: `${provider.fromAddress.firstName} ${provider.fromAddress.lastName}`,
        address_line1: provider.fromAddress.address1,
        address_line2: provider.fromAddress.address2,
        city_locality: provider.fromAddress.city,
        state_province: provider.fromAddress.province,
        postal_code: provider.fromAddress.postalCode,
        country_code: provider.fromAddress.country.iso2,
        phone: provider.fromAddress.phone,
      },
      packages: [
        {
          weight: convertedWeight,
          dimensions: {
            length: convertedDimensions.length,
            width: convertedDimensions.width,
            height: convertedDimensions.height,
            unit: convertedDimensions.unit,
          },
        },
      ],
    },
    // rate_options is mandatory – we supply the gathered carrier_ids.
    rate_options: { carrier_ids },
  };

  const response = await fetch(`${SHIPENGINE_API_URL}/rates`, {
    method: "POST",
    headers: {
      "API-Key": provider.accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to get rates");
  }

  // Map the returned ShipEngine rate objects to our expected schema.
  // In our manual shipment example, each object contains id, providerId, service, carrier, price, currency, estimatedDays.
  return result.rate_response.rates.map((rate) => {
    // Calculate the full price as the sum of shipping_amount and other_amount.
    const shippingAmt =
      (rate.shipping_amount && rate.shipping_amount.amount) || 0;
    const otherAmt = (rate.other_amount && rate.other_amount.amount) || 0;
    const totalPrice = Number(shippingAmt + otherAmt).toFixed(2);

    // For ShipEngine, package the rate identifier along with the service.
    const idValue = JSON.stringify({
      id: rate.rate_id,
      service: rate.service_code,
    });

    return {
      id: idValue,
      providerId: provider.id,
      service: rate.service_type || rate.service_code,
      carrier: rate.carrier_friendly_name || rate.carrier_code,
      price: totalPrice,
      currency: rate.shipping_amount
        ? rate.shipping_amount.currency.toUpperCase()
        : "USD",
      estimatedDays: rate.delivery_days || rate.estimated_delivery_days,
    };
  });
}

// Validates an address using ShipEngine
export async function validateAddressFunction({ provider, address }) {
  try {
    const payload = {
      address: {
        name: `${address.firstName} ${address.lastName}`,
        address_line1: address.address1,
        address_line2: address.address2,
        city_locality: address.city,
        state_province: address.province,
        postal_code: address.postalCode,
        country_code: address.country.iso2,
        phone: address.phone,
      },
    };

    const response = await fetch(`${SHIPENGINE_API_URL}/addresses/validate`, {
      method: "POST",
      headers: {
        "API-Key": provider.accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const validation = await response.json();
    if (!response.ok) {
      throw new Error(validation.message || "Address validation failed");
    }

    return {
      isValid: validation.is_valid,
      suggestedAddress: validation.is_valid
        ? {
            address1: validation.address_line1,
            address2: validation.address_line2,
            city: validation.city_locality,
            province: validation.state_province,
            postalCode: validation.postal_code,
            country: validation.country_code,
          }
        : null,
      errors: validation.messages || [],
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [error.message],
    };
  }
}

// Tracks a shipment using ShipEngine
export async function trackShipmentFunction({ provider, trackingNumber }) {
  const payload = {
    tracking_number: trackingNumber,
    // Optionally include additional fields like carrier_code if required
  };

  const response = await fetch(`${SHIPENGINE_API_URL}/tracking`, {
    method: "POST",
    headers: {
      "API-Key": provider.accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const tracking = await response.json();
  if (!response.ok) {
    throw new Error(tracking.message || "Failed to track shipment");
  }

  // Map response to a common format. Adjust based on actual ShipEngine response structure.
  return {
    status: tracking.status,
    estimatedDelivery: tracking.estimated_delivery_date,
    trackingUrl: tracking.tracking_url,
    events: tracking.events
      ? tracking.events.map((event) => ({
          status: event.status,
          location: event.location,
          timestamp: event.date,
          message: event.detail,
        }))
      : [],
  };
}

// Cancels a label (refunds a shipment) using ShipEngine
export async function cancelLabelFunction({ provider, labelId }) {
  try {
    const payload = { label_id: labelId };
    const response = await fetch(`${SHIPENGINE_API_URL}/labels/cancel`, {
      method: "POST",
      headers: {
        "API-Key": provider.accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to cancel label");
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
