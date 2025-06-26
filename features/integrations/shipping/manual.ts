const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function getRatesFunction({ provider, order }) {
  // Simulate API delay
  await sleep(1000);

  return [
    {
      id: "rate_usps_1",
      providerId: provider.id,
      service: "Priority Mail",
      carrier: "USPS",
      price: "7.99",
      currency: "USD",
      estimatedDays: 3,
    },
    {
      id: "rate_usps_2",
      providerId: provider.id,
      service: "Priority Mail Express",
      carrier: "USPS",
      price: "26.99",
      currency: "USD",
      estimatedDays: 1,
    },
    {
      id: "rate_ups_1",
      providerId: provider.id,
      service: "Ground",
      carrier: "UPS",
      price: "8.99",
      currency: "USD",
      estimatedDays: 4,
    },
    {
      id: "rate_ups_2",
      providerId: provider.id,
      service: "2nd Day Air",
      carrier: "UPS",
      price: "19.99",
      currency: "USD",
      estimatedDays: 2,
    },
    {
      id: "rate_fedex_1",
      providerId: provider.id,
      service: "Ground",
      carrier: "FedEx",
      price: "9.99",
      currency: "USD",
      estimatedDays: 4,
    },
    {
      id: "rate_fedex_2",
      providerId: provider.id,
      service: "2Day",
      carrier: "FedEx",
      price: "21.99",
      currency: "USD",
      estimatedDays: 2,
    },
    {
      id: "rate_dhl_1",
      providerId: provider.id,
      service: "Express Worldwide",
      carrier: "DHL",
      price: "29.99",
      currency: "USD",
      estimatedDays: 2,
    },
    {
      id: "rate_dhl_2",
      providerId: provider.id,
      service: "Express Economy",
      carrier: "DHL",
      price: "18.99",
      currency: "USD",
      estimatedDays: 4,
    }
  ];
}

export async function createLabelFunction({ provider, order, rate }) {
  await sleep(1500);

  const carrierPrefix = rate.carrier || "UNKNOWN";
  const trackingFormats = {
    'USPS': '94001234567890123456',
    'UPS': '1Z999AA1234567890',
    'FedEx': '123456789012',
    'DHL': '1234567890'
  };

  const baseTrackingUrls = {
    'USPS': 'https://tools.usps.com/go/TrackConfirmAction?tLabels=',
    'UPS': 'https://www.ups.com/track?tracknum=',
    'FedEx': 'https://www.fedex.com/fedextrack/?trknbr=',
    'DHL': 'https://www.dhl.com/en/express/tracking.html?AWB='
  };

  const trackingNumber = trackingFormats[rate.carrier] || (carrierPrefix + Math.random().toString(36).substring(2, 10).toUpperCase());
  const trackingUrl = baseTrackingUrls[rate.carrier] ? baseTrackingUrls[rate.carrier] + trackingNumber : "https://example.com/track";

  return {
    status: "SUCCESS",
    data: {
      rate_id: rate.id,
      created_at: new Date().toISOString(),
    },
    rate: rate,
    trackingNumber,
    trackingUrl,
    labelUrl: `https://api.example.com/shipping/labels/${rate.carrier.toLowerCase()}/${trackingNumber}.pdf`,
  };
}

export async function validateAddressFunction({ provider, address }) {
  await sleep(800);

  return {
    isValid: true,
    suggestedAddress: null,
    errors: []
  };
}

export async function trackShipmentFunction({ provider, trackingNumber }) {
  await sleep(700);

  const carrierFromTracking = 
    trackingNumber.startsWith('94') ? 'USPS' :
    trackingNumber.startsWith('1Z') ? 'UPS' :
    trackingNumber.length === 12 ? 'FedEx' : 'DHL';

  const locations = {
    'USPS': ['USPS Facility', 'Local Post Office', 'Regional Distribution Center'],
    'UPS': ['UPS Hub', 'Local UPS Facility', 'UPS Distribution Center'],
    'FedEx': ['FedEx Hub', 'Local FedEx Station', 'FedEx Sort Facility'],
    'DHL': ['DHL Gateway', 'Local DHL Facility', 'DHL Service Center']
  };

  const carrierLocations = locations[carrierFromTracking];

  return {
    status: "in_transit",
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    trackingUrl: `https://example.com/track/${carrierFromTracking.toLowerCase()}/${trackingNumber}`,
    events: [
      {
        status: "in_transit",
        location: carrierLocations[0],
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        message: "Package is in transit"
      },
      {
        status: "picked_up",
        location: carrierLocations[1],
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        message: "Package has been picked up"
      },
      {
        status: "label_created",
        location: carrierLocations[2],
        timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        message: "Shipping label created"
      }
    ]
  };
}

export async function cancelLabelFunction({ provider, labelId }) {
  await sleep(500);

  return {
    success: true,
    error: null
  };
} 