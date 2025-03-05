import { Globe2, CreditCard, Package, ShoppingBag } from "lucide-react";
import seedData from "./seed.json";

export const STORE_TEMPLATES = {
  full: {
    name: "Complete Setup",
    description:
      "Start with a fully configured store including multiple regions, payment methods, and a rich product catalog - recommended for most stores",
    requirements: {
      regions: 3,
      "payment-providers": 3,
      shipping: 3,
      categories: 4,
      collections: 3,
      products: 10,
    },
  },
  minimal: {
    name: "Basic Setup",
    description:
      "Start with just the essentials - one region, one payment method, and basic products. Perfect for testing or simple stores",
    requirements: {
      regions: 1,
      "payment-providers": 1,
      shipping: 1,
      categories: 1,
      collections: 1,
      products: 1,
    },
  },
};

export const PAYMENT_PROVIDERS = {
  pp_stripe_stripe: {
    envRequirements: ["NEXT_PUBLIC_STRIPE_KEY", "STRIPE_SECRET_KEY"],
    envDescriptions: {
      NEXT_PUBLIC_STRIPE_KEY: "Stripe Publishable Key",
      STRIPE_SECRET_KEY: "Stripe Secret Key",
    },
    envTip: <p>These values must be retrieved from <a className="text-blue-500" href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer">Stripe</a> and set in the <code>.env</code> file</p>
    // envTip:
    //   "These environment variables are required for Stripe payment processing. Find them in your Stripe Dashboard under API Keys and add them to your .env file.",
  },
  pp_paypal_paypal: {
    envRequirements: ["NEXT_PUBLIC_PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET", "PAYPAL_SANDBOX_MODE"],
    envDescriptions: {
      NEXT_PUBLIC_PAYPAL_CLIENT_ID: "PayPal Client ID",
      PAYPAL_CLIENT_SECRET: "PayPal Secret Key",
      PAYPAL_SANDBOX_MODE: "Set to true if you are using Paypal Sandbox (Default: false)",
    },
    envTip: <p>These values must be retrieved from <a className="text-blue-500" href="https://developer.paypal.com/dashboard" target="_blank" rel="noopener noreferrer">PayPal</a> and set in the <code>.env</code> file</p>
    // envTip:
    //   "These environment variables are required for PayPal payment processing. Find them in your PayPal Developer Dashboard under API Credentials and add them to your .env file. If you are using Paypal Sandbox, set the PAYPAL_SANDBOX_MODE to true.",
  },
  pp_system_default: {
    envRequirements: null,
    envTip:
      "Manual payment processing is useful for testing or if you offer Cash on Delivery (COD) options.",
  },
};

export const steps = [
  {
    id: "regions",
    title: "Regions & Countries",
    subtitle: "Set up your sales regions",
    icon: Globe2,
    description:
      "Configure regions with their currencies and select countries where you want to sell.",
    buttonText: "Configure Regions",
    status: "current",
    items: seedData.regions.map((region) => ({
      type: "region",
      data: {
        ...region,
        currency: {
          code: region.currencyCode,
          symbol: region.currencySymbol,
          name: region.currencyName,
        },
      },
      title: `${region.name}`,
      description: `${region.currencyName} • ${region.taxRate * 100}% tax`,
      countries: region.countries.map((country) => ({
        type: "country",
        data: country,
        title: country.name,
        parentRegion: region.code,
      })),
    })),
  },
  {
    id: "payment-providers",
    title: "Payment Providers",
    subtitle: "Configure payment methods",
    icon: CreditCard,
    description: "Select the payment providers you want to use.",
    buttonText: "Configure Payments",
    status: "upcoming",
    items: seedData.paymentProviders.map((provider) => ({
      type: "paymentProvider",
      data: {
        ...provider,
        envRequirements: PAYMENT_PROVIDERS[provider.code]?.envRequirements,
        envDescriptions: PAYMENT_PROVIDERS[provider.code]?.envDescriptions,
        envTip: PAYMENT_PROVIDERS[provider.code]?.envTip,
      },
      title: provider.name,
    })),
  },
  {
    id: "shipping",
    title: "Shipping Options",
    subtitle: "Set up shipping methods",
    icon: Package,
    description: "Configure shipping options for your regions.",
    buttonText: "Configure Shipping",
    status: "upcoming",
    items: seedData.shipping_options.map((option) => ({
      type: "shippingOption",
      data: option,
      title: option.name,
      description: `${option.amount} • ${option.regionCode === 'all' ? 'All Regions' : option.regionCode}`,
    })),
  },
  {
    id: "categories",
    title: "Product Categories",
    subtitle: "Organize your products",
    icon: ShoppingBag,
    description: "Create categories to organize your products.",
    buttonText: "Configure Categories",
    status: "upcoming",
    items: seedData.categories.map((category) => ({
      type: "productCategory",
      data: category,
      title: category.name,
      description: category.description,
    })),
  },
  {
    id: "collections",
    title: "Product Collections",
    subtitle: "Create product collections",
    icon: ShoppingBag,
    description: "Group products into collections for easier discovery.",
    buttonText: "Configure Collections",
    status: "upcoming",
    items: seedData.collections.map((collection) => ({
      type: "productCollection",
      data: collection,
      title: collection.title,
      description: collection.description,
    })),
  },
  {
    id: "products",
    title: "Products",
    subtitle: "Add your products",
    icon: ShoppingBag,
    description: "Add products to your store.",
    buttonText: "Configure Products",
    status: "upcoming",
    items: seedData.products.map((product) => ({
      type: "product",
      data: product,
      title: product.title,
      description: product.description,
    })),
  },
];

