"use server";

// Define types for the shipping provider and function parameters
type ShippingProvider = {
  [key: string]: string;
};

type AdapterFunctionParams = {
  provider: ShippingProvider;
  functionName: string;
  args: Record<string, unknown>;
};

/**
 * Executes a shipping provider adapter function
 * @param params - Parameters including provider, function name, and arguments
 * @returns The result from the adapter function
 */
export async function executeAdapterFunction({
  provider,
  functionName,
  args
}: AdapterFunctionParams): Promise<unknown> {
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
    `../../integrations/shipping/${functionPath}.ts`
  );

  const fn = adapter[functionName];
  if (!fn) {
    throw new Error(
      `Function ${functionName} not found in adapter ${functionPath}`
    );
  }

  try {
    return await fn({ provider, ...args });
  } catch (error: any) {
    throw new Error(
      `Error executing ${functionName} for provider ${functionPath}: ${error.message}`
    );
  }
}

// Define types for common function parameters
type Order = Record<string, unknown>;
type Dimensions = Record<string, unknown>;
type Address = Record<string, unknown>;
type LineItem = Record<string, unknown>;

type CreateLabelParams = {
  provider: ShippingProvider;
  order: Order;
  rateId: string;
  dimensions: Dimensions;
  lineItems: LineItem[];
};

type GetRatesParams = {
  provider: ShippingProvider;
  order: Order;
  dimensions: Dimensions;
};

type ValidateAddressParams = {
  provider: ShippingProvider;
  address: Address;
};

type TrackShipmentParams = {
  provider: ShippingProvider;
  trackingNumber: string;
};

type CancelLabelParams = {
  provider: ShippingProvider;
  labelId: string;
};

// Helper functions for common operations
/**
 * Creates a shipping label
 * @param params - Parameters for creating a label
 * @returns The created label information
 */
export async function createLabel({ provider, order, rateId, dimensions, lineItems }: CreateLabelParams): Promise<unknown> {
  return executeAdapterFunction({
    provider,
    functionName: "createLabelFunction",
    args: { order, rateId, dimensions, lineItems },
  });
}

/**
 * Gets shipping rates
 * @param params - Parameters for getting rates
 * @returns Available shipping rates
 */
export async function getRates({ provider, order, dimensions }: GetRatesParams): Promise<unknown> {
  return executeAdapterFunction({
    provider,
    functionName: "getRatesFunction",
    args: { order, dimensions },
  });
}

/**
 * Validates a shipping address
 * @param params - Parameters for validating an address
 * @returns Address validation results
 */
export async function validateAddress({ provider, address }: ValidateAddressParams): Promise<unknown> {
  return executeAdapterFunction({
    provider,
    functionName: "validateAddressFunction",
    args: { address },
  });
}

/**
 * Tracks a shipment
 * @param params - Parameters for tracking a shipment
 * @returns Tracking information
 */
export async function trackShipment({ provider, trackingNumber }: TrackShipmentParams): Promise<unknown> {
  return executeAdapterFunction({
    provider,
    functionName: "trackShipmentFunction",
    args: { trackingNumber },
  });
}

/**
 * Cancels a shipping label
 * @param params - Parameters for canceling a label
 * @returns Cancellation results
 */
export async function cancelLabel({ provider, labelId }: CancelLabelParams): Promise<unknown> {
  return executeAdapterFunction({
    provider,
    functionName: "cancelLabelFunction",
    args: { labelId },
  });
}
