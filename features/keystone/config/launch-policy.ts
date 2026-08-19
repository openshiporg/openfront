export type CommerceLaunchPolicy = {
  legalEntityId: string;
  reportingCurrency: string;
  supportedCountries: string[];
  supportedCurrencies: string[];
  supportedPaymentProviderCodes: string[];
  prohibitedProductTagIds: string[];
  taxMode: "configured_rate" | "external_provider";
  retentionPolicyVersion: string;
  privacyPolicyVersion: string;
  accountingPolicyVersion: string;
};

const developmentPolicy: CommerceLaunchPolicy = {
  legalEntityId: "development-merchant",
  reportingCurrency: "USD",
  supportedCountries: [],
  supportedCurrencies: ["USD", "EUR", "GBP"],
  supportedPaymentProviderCodes: [
    "pp_stripe_stripe",
    "pp_paypal_paypal",
    "pp_system_default",
  ],
  prohibitedProductTagIds: [],
  taxMode: "configured_rate",
  retentionPolicyVersion: "development-only",
  privacyPolicyVersion: "development-only",
  accountingPolicyVersion: "development-only",
};

function parsePolicy(): CommerceLaunchPolicy {
  const raw = process.env.COMMERCE_LAUNCH_POLICY;
  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("COMMERCE_LAUNCH_POLICY is required in production");
    }
    return developmentPolicy;
  }

  let value: any;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error("COMMERCE_LAUNCH_POLICY must be valid JSON");
  }

  const requiredStrings = [
    "legalEntityId",
    "reportingCurrency",
    "taxMode",
    "retentionPolicyVersion",
    "privacyPolicyVersion",
    "accountingPolicyVersion",
  ];
  for (const key of requiredStrings) {
    if (!value[key] || typeof value[key] !== "string") {
      throw new Error(`COMMERCE_LAUNCH_POLICY.${key} is required`);
    }
  }
  if (!Array.isArray(value.supportedCountries) || !value.supportedCountries.length) {
    throw new Error("COMMERCE_LAUNCH_POLICY.supportedCountries must be non-empty");
  }
  if (!Array.isArray(value.supportedCurrencies) || !value.supportedCurrencies.length) {
    throw new Error("COMMERCE_LAUNCH_POLICY.supportedCurrencies must be non-empty");
  }
  if (!Array.isArray(value.prohibitedProductTagIds)) {
    throw new Error("COMMERCE_LAUNCH_POLICY.prohibitedProductTagIds must be an array");
  }
  if (
    !Array.isArray(value.supportedPaymentProviderCodes) ||
    !value.supportedPaymentProviderCodes.length
  ) {
    throw new Error(
      "COMMERCE_LAUNCH_POLICY.supportedPaymentProviderCodes must be non-empty"
    );
  }
  if (!["configured_rate", "external_provider"].includes(value.taxMode)) {
    throw new Error("COMMERCE_LAUNCH_POLICY.taxMode is invalid");
  }

  return {
    ...value,
    reportingCurrency: value.reportingCurrency.toUpperCase(),
    supportedCountries: value.supportedCountries.map((code: string) => code.toLowerCase()),
    supportedCurrencies: value.supportedCurrencies.map((code: string) => code.toUpperCase()),
  };
}

export const commerceLaunchPolicy = parsePolicy();

export function assertCheckoutWithinLaunchPolicy(cart: any, providerCode?: string) {
  const country = cart.shippingAddress?.country?.iso2?.toLowerCase();
  const currency = cart.region?.currency?.code?.toUpperCase();
  if (!currency || !commerceLaunchPolicy.supportedCurrencies.includes(currency)) {
    throw new Error("Cart currency is outside the supported launch boundary");
  }
  const prohibitedTags = new Set(commerceLaunchPolicy.prohibitedProductTagIds);
  if (
    cart.lineItems?.some((line: any) =>
      line.productVariant?.product?.productTags?.some((tag: any) => prohibitedTags.has(tag.id))
    )
  ) {
    throw new Error("Cart contains a product outside the supported launch boundary");
  }
  if (
    commerceLaunchPolicy.supportedCountries.length &&
    (!country || !commerceLaunchPolicy.supportedCountries.includes(country))
  ) {
    throw new Error("Shipping destination is outside the supported launch boundary");
  }
  if (
    providerCode &&
    !commerceLaunchPolicy.supportedPaymentProviderCodes.includes(providerCode)
  ) {
    throw new Error("Payment provider is outside the supported launch boundary");
  }
  if (
    commerceLaunchPolicy.taxMode === "external_provider" &&
    !cart.metadata?.taxTransaction
  ) {
    throw new Error("A committed external tax transaction is required");
  }
}
