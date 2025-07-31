// Popular region templates for quick setup
export const POPULAR_REGIONS = [
  {
    name: "North America",
    code: "NA",
    description: "United States, Canada, and Mexico with USD, CAD, MXN currencies",
    countries: [
      { iso2: "US", iso3: "USA", displayName: "United States", numCode: 840 },
      { iso2: "CA", iso3: "CAN", displayName: "Canada", numCode: 124 },
      { iso2: "MX", iso3: "MEX", displayName: "Mexico", numCode: 484 },
    ],
    currencies: [
      { code: "USD", name: "US Dollar", symbol: "$", symbolNative: "$" },
      { code: "CAD", name: "Canadian Dollar", symbol: "CA$", symbolNative: "$" },
      { code: "MXN", name: "Mexican Peso", symbol: "MX$", symbolNative: "$" },
    ],
    defaultCurrency: "USD",
    taxRate: 0,
    automaticTaxes: false,
    paymentProviders: ["stripe", "paypal"]
  },
  {
    name: "Europe",
    code: "EU", 
    description: "Major European countries with EUR and GBP currencies",
    countries: [
      { iso2: "DE", iso3: "DEU", displayName: "Germany", numCode: 276 },
      { iso2: "FR", iso3: "FRA", displayName: "France", numCode: 250 },
      { iso2: "IT", iso3: "ITA", displayName: "Italy", numCode: 380 },
      { iso2: "ES", iso3: "ESP", displayName: "Spain", numCode: 724 },
      { iso2: "GB", iso3: "GBR", displayName: "United Kingdom", numCode: 826 },
      { iso2: "NL", iso3: "NLD", displayName: "Netherlands", numCode: 528 },
    ],
    currencies: [
      { code: "EUR", name: "Euro", symbol: "€", symbolNative: "€" },
      { code: "GBP", name: "British Pound", symbol: "£", symbolNative: "£" },
    ],
    defaultCurrency: "EUR",
    taxRate: 20,
    automaticTaxes: true,
    paymentProviders: ["stripe", "paypal", "klarna"]
  },
  {
    name: "Japan",
    code: "JP",
    description: "Japan with JPY currency and local payment methods",
    countries: [
      { iso2: "JP", iso3: "JPN", displayName: "Japan", numCode: 392 },
    ],
    currencies: [
      { code: "JPY", name: "Japanese Yen", symbol: "¥", symbolNative: "￥" },
    ],
    defaultCurrency: "JPY",
    taxRate: 10,
    automaticTaxes: true,
    paymentProviders: ["stripe", "konbini"]
  },
  {
    name: "Australia & New Zealand",
    code: "AUNZ",
    description: "Australia and New Zealand with AUD and NZD currencies",
    countries: [
      { iso2: "AU", iso3: "AUS", displayName: "Australia", numCode: 36 },
      { iso2: "NZ", iso3: "NZL", displayName: "New Zealand", numCode: 554 },
    ],
    currencies: [
      { code: "AUD", name: "Australian Dollar", symbol: "A$", symbolNative: "$" },
      { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", symbolNative: "$" },
    ],
    defaultCurrency: "AUD",
    taxRate: 10,
    automaticTaxes: true,
    paymentProviders: ["stripe", "afterpay"]
  },
  {
    name: "United Kingdom",
    code: "GB",
    description: "United Kingdom with GBP currency",
    countries: [
      { iso2: "GB", iso3: "GBR", displayName: "United Kingdom", numCode: 826 },
    ],
    currencies: [
      { code: "GBP", name: "British Pound", symbol: "£", symbolNative: "£" },
    ],
    defaultCurrency: "GBP", 
    taxRate: 20,
    automaticTaxes: true,
    paymentProviders: ["stripe", "paypal"]
  },
  {
    name: "Southeast Asia",
    code: "SEA",
    description: "Singapore, Malaysia, Thailand, and Philippines",
    countries: [
      { iso2: "SG", iso3: "SGP", displayName: "Singapore", numCode: 702 },
      { iso2: "MY", iso3: "MYS", displayName: "Malaysia", numCode: 458 },
      { iso2: "TH", iso3: "THA", displayName: "Thailand", numCode: 764 },
      { iso2: "PH", iso3: "PHL", displayName: "Philippines", numCode: 608 },
    ],
    currencies: [
      { code: "SGD", name: "Singapore Dollar", symbol: "S$", symbolNative: "$" },
      { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", symbolNative: "RM" },
      { code: "THB", name: "Thai Baht", symbol: "฿", symbolNative: "฿" },
      { code: "PHP", name: "Philippine Peso", symbol: "₱", symbolNative: "₱" },
    ],
    defaultCurrency: "SGD",
    taxRate: 7,
    automaticTaxes: true,
    paymentProviders: ["stripe", "grabpay"]
  }
];