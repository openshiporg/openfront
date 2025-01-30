"use server";

export async function executeAdapterFunction({ provider, functionName, args }) {
  const functionPath = provider[functionName];

  if (functionPath.startsWith("http")) {
    const response = await fetch(functionPath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, ...args }),
    });

    if (!response.ok) {
      throw new Error(`HTTP request failed: ${response.statusText}`);
    }
    return response.json();
  }

  const adapter = await import(
    `../../shippingProviderAdapters/${functionPath}.js`
  );

  const fn = adapter[functionName];
  if (!fn) {
    throw new Error(
      `Function ${functionName} not found in adapter ${functionPath}`
    );
  }

  try {
    return await fn({ provider, ...args });
  } catch (error) {
    throw new Error(
      `Error executing ${functionName} for provider ${functionPath}: ${error.message}`
    );
  }
}

// Helper functions for common operations
export async function createLabel({ provider, order, rateId, dimensions, lineItems }) {
  return executeAdapterFunction({
    provider,
    functionName: "createLabelFunction",
    args: { order, rateId, dimensions, lineItems },
  });
}

export async function getRates({ provider, order, dimensions }) {
  return executeAdapterFunction({
    provider,
    functionName: "getRatesFunction",
    args: { order, dimensions },
  });
}

export async function validateAddress({ provider, address }) {
  return executeAdapterFunction({
    provider,
    functionName: "validateAddressFunction",
    args: { address },
  });
}

export async function trackShipment({ provider, trackingNumber }) {
  return executeAdapterFunction({
    provider,
    functionName: "trackShipmentFunction",
    args: { trackingNumber },
  });
}

export async function cancelLabel({ provider, labelId }) {
  return executeAdapterFunction({
    provider,
    functionName: "cancelLabelFunction",
    args: { labelId },
  });
}
