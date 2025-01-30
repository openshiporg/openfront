export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed' });
//   }

  try {
    const response = await fetch('https://api.goshippo.com/shipments/', {
      method: 'POST',
      headers: {
        'Authorization': 'ShippoToken shippo_test_f523be0c570e5f1165128a8b54660b4f11a287fa',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address_from: {
          name: "Mr. Hippo",
          street1: "215 Clayton St.",
          city: "San Francisco",
          state: "CA",
          zip: "94117",
          country: "US"
        },
        address_to: {
          name: "Mrs. Hippo",
          street1: "965 Mission St.",
          city: "San Francisco",
          state: "CA",
          zip: "94105",
          country: "US"
        },
        parcels: [{
          length: "5",
          width: "5",
          height: "5",
          distance_unit: "in",
          weight: "2",
          mass_unit: "lb"
        }],
        async: false
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error creating shipment');
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Shippo error:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
} 