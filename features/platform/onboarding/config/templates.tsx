import { Building2, Package, CircleCheck } from 'lucide-react';

export interface StoreTemplate {
  name: string;
  description: string;
  icon: React.ReactNode;
  regions: string[];
  paymentProviders: string[];
  shipping: string[];
  categories: string[];
  collections: string[];
  products: string[];
  displayNames: {
    store: string[];
    regions: string[];
    paymentProviders: string[];
    shipping: string[];
    categories: string[];
    collections: string[];
    products: string[];
  };
}

export const STORE_TEMPLATES: Record<'full' | 'minimal' | 'custom', StoreTemplate> = {
  full: {
    name: 'Complete Setup',
    description:
      'Start with a fully configured store including multiple regions, payment methods, and a rich product catalog.',
    icon: <Building2 className="h-5 w-5" />,
    regions: ['na', 'eu', 'uk'],
    paymentProviders: [
      'pp_stripe_stripe',
      'pp_paypal_paypal',
      'pp_system_default',
    ],
    shipping: ['Standard Shipping', 'Express Shipping', 'Return Shipping'],
    categories: ['shirts', 'hoodies', 'accessories', 'pants'],
    collections: ['latest-picks', 'new-arrivals', 'trending'],
    products: [
      'penrose-triangle-tshirt',
      'eschers-staircase-hoodie',
      'mobius-strip-scarf',
      'fibonacci-spiral-crop-top',
      'quantum-entanglement-socks',
      'schrodingers-cat-tank-top',
      'klein-bottle-beanie',
      'paradox-puzzle-sweater',
      'heisenberg-uncertainty-joggers',
      'mandelbrot-set-infinity-shawl',
    ],
    displayNames: {
      store: ['Impossible Tees'],
      regions: ['North America (USD)', 'Europe (EUR)', 'United Kingdom (GBP)'],
      paymentProviders: ['Stripe', 'PayPal', 'Cash on Delivery'],
      shipping: ['Standard Shipping', 'Express Shipping', 'Return Shipping'],
      categories: ['Shirts', 'Hoodies', 'Accessories', 'Pants'],
      collections: ['Latest Picks', 'New Arrivals', 'Trending'],
      products: [
        'Penrose Triangle T-Shirt',
        "Escher's Staircase Hoodie",
        'Möbius Strip Scarf',
        'Fibonacci Spiral Crop Top',
        'Quantum Entanglement Socks',
        "Schrödinger's Cat Tank Top",
        'Klein Bottle Beanie',
        'Paradox Puzzle Sweater',
        "Heisenberg's Uncertainty Principle Joggers",
        'Mandelbrot Set Infinity Shawl',
      ],
    },
  },
  minimal: {
    name: 'Basic Setup',
    description:
      'Start with just the essentials - one region, one payment method, and basic products.',
    icon: <Package className="h-5 w-5" />,
    regions: ['na'],
    paymentProviders: ['pp_system_default'],
    shipping: ['Standard Shipping'],
    categories: ['shirts'],
    collections: ['latest-picks'],
    products: ['penrose-triangle-tshirt'],
    displayNames: {
      store: ['Impossible Tees'],
      regions: ['North America (USD)'],
      paymentProviders: ['Cash on Delivery'],
      shipping: ['Standard Shipping'],
      categories: ['Shirts'],
      collections: ['Latest Picks'],
      products: ['Penrose Triangle T-Shirt'],
    },
  },
  custom: {
    name: 'Custom Setup',
    description:
      'Customize your setup with your own JSON templates for each section.',
    icon: <CircleCheck className="h-5 w-5" />,
    regions: ['na'],
    paymentProviders: ['pp_system_default'],
    shipping: ['Standard Shipping'],
    categories: ['shirts'],
    collections: ['latest-picks'],
    products: ['penrose-triangle-tshirt'],
    displayNames: {
      store: ['Impossible Tees'],
      regions: ['North America (USD)'],
      paymentProviders: ['Cash on Delivery'],
      shipping: ['Standard Shipping'],
      categories: ['Shirts'],
      collections: ['Latest Picks'],
      products: ['Penrose Triangle T-Shirt'],
    },
  },
};

export interface SectionDefinition {
  id: number;
  type: string;
  label: string;
  getItemsFn: (template: 'full' | 'minimal' | 'custom') => string[];
  jsonKey: 'regions' | 'paymentProviders' | 'shipping_options' | 'categories' | 'collections' | 'products';
}

export const SECTION_DEFINITIONS: SectionDefinition[] = [
  {
    id: 1,
    type: 'store',
    label: 'Store Information',
    getItemsFn: () => ['Impossible Tees'],
    jsonKey: 'store' as const,
  },
  {
    id: 2,
    type: 'regions',
    label: 'Regions & Countries',
    getItemsFn: (template) => STORE_TEMPLATES[template].displayNames.regions,
    jsonKey: 'regions' as const,
  },
  {
    id: 3,
    type: 'paymentProviders',
    label: 'Payment Providers',
    getItemsFn: (template) => STORE_TEMPLATES[template].displayNames.paymentProviders,
    jsonKey: 'paymentProviders' as const,
  },
  {
    id: 4,
    type: 'shipping',
    label: 'Shipping Options',
    getItemsFn: (template) => STORE_TEMPLATES[template].displayNames.shipping,
    jsonKey: 'shipping_options' as const,
  },
  {
    id: 5,
    type: 'categories',
    label: 'Product Categories',
    getItemsFn: (template) => STORE_TEMPLATES[template].displayNames.categories,
    jsonKey: 'categories' as const,
  },
  {
    id: 6,
    type: 'collections',
    label: 'Collections',
    getItemsFn: (template) => STORE_TEMPLATES[template].displayNames.collections,
    jsonKey: 'collections' as const,
  },
  {
    id: 7,
    type: 'products',
    label: 'Products',
    getItemsFn: (template) => STORE_TEMPLATES[template].displayNames.products,
    jsonKey: 'products' as const,
  },
];