import {
  Package,
  Users,
  Tag,
  Gift,
  BadgeDollarSign,
  BarChart3,
  LayoutList,
  Truck,
  Settings,
  Ticket,
  Sparkles,
  LucideIcon,
  Group,
  Boxes,
  Globe,
  DollarSign,
  CreditCard,
  MapPin,
  Grid3x3,
  Package2,
  Store,
  Layers,
  RefreshCw,
  Building,
  ShieldCheck
} from 'lucide-react';

export interface PlatformNavItem {
  title: string;
  href: string;
  color: string;
  description: string;
  icon?: LucideIcon;
  group?: string;
}

export interface PlatformNavGroup {
  id: string;
  title: string;
  icon: LucideIcon;
  items: PlatformNavItem[];
}

// Core platform navigation items organized by logical groups
export const platformNavItems: PlatformNavItem[] = [
  // Standalone Items
  {
    title: 'Orders',
    href: '/platform/orders',
    color: 'blue',
    description: 'Manage customer orders, returns, claims, and fulfillment.',
    icon: Ticket,
    group: 'standalone'
  },
  {
    title: 'Analytics',
    href: '/platform/analytics',
    color: 'indigo',
    description: 'View sales reports, customer insights, and business performance metrics.',
    icon: BarChart3,
    group: 'standalone'
  },
  {
    title: 'Markets',
    href: '/platform/markets',
    color: 'blue',
    description: 'Manage regions, currencies, countries, and shipping in one place.',
    icon: Globe,
    group: 'standalone'
  },

  // Products & Catalog
  {
    title: 'Products',
    href: '/platform/products',
    color: 'green',
    description: 'Create and manage your product catalog, pricing, and inventory.',
    icon: Package,
    group: 'catalog'
  },
  {
    title: 'Categories',
    href: '/platform/product-categories',
    color: 'lime',
    description: 'Organize products into categories and manage their hierarchy.',
    icon: Group,
    group: 'catalog'
  },
  {
    title: 'Collections',
    href: '/platform/product-collections',
    color: 'amber',
    description: 'Organize products into marketing collections.',
    icon: Grid3x3,
    group: 'catalog'
  },

  // Customers & Users
  {
    title: 'Users',
    href: '/platform/users',
    color: 'purple',
    description: 'Manage customer accounts, profiles, and user permissions.',
    icon: Users,
    group: 'customers'
  },

  // Marketing & Growth
  {
    title: 'Discounts',
    href: '/platform/discounts',
    color: 'pink',
    description: 'Manage discount codes, promotional campaigns, and coupon rules.',
    icon: Tag,
    group: 'marketing'
  },
  {
    title: 'Price Lists',
    href: '/platform/price-lists',
    color: 'emerald',
    description: 'Create and manage customer-specific pricing and price lists.',
    icon: BadgeDollarSign,
    group: 'marketing'
  },
  {
    title: 'Gift Cards',
    href: '/platform/gift-cards',
    color: 'rose',
    description: 'Manage gift card creation, balance tracking, and redemption.',
    icon: Gift,
    group: 'marketing'
  },
  {
    title: 'Shipping Options',
    href: '/platform/shipping-options',
    color: 'sky',
    description: 'Configure customer-facing shipping methods and pricing.',
    icon: Truck,
    group: 'marketing'
  },

  // Integrations
  {
    title: 'Shipping Providers',
    href: '/platform/shipping-providers',
    color: 'cyan',
    description: 'Manage shipping provider configurations and settings.',
    icon: Package2,
    group: 'integrations'
  },
  {
    title: 'Payment Providers',
    href: '/platform/payment-providers',
    color: 'slate',
    description: 'Configure payment gateways and provider settings.',
    icon: CreditCard,
    group: 'integrations'
  },
  {
    title: 'OMS',
    href: '/platform/order-management-system',
    color: 'orange',
    description: 'OAuth authorization and app installation for order management systems.',
    icon: Settings,
    group: 'integrations'
  },
];

// Standalone navigation items (no grouping)
export const platformStandaloneItems = platformNavItems.filter(item => item.group === 'standalone')

// Organized navigation groups following e-commerce best practices
export const platformNavGroups: PlatformNavGroup[] = [
  {
    id: 'catalog',
    title: 'Products',
    icon: Package,
    items: platformNavItems.filter(item => item.group === 'catalog')
  },
  {
    id: 'customers',
    title: 'Customers',
    icon: Users,
    items: platformNavItems.filter(item => item.group === 'customers')
  },
  {
    id: 'marketing',
    title: 'Marketing',
    icon: BarChart3,
    items: platformNavItems.filter(item => item.group === 'marketing')
  },
  {
    id: 'integrations',
    title: 'Integrations',
    icon: RefreshCw,
    items: platformNavItems.filter(item => item.group === 'integrations')
  }
];

// Helper function to get platform nav items with full paths
export function getPlatformNavItemsWithBasePath(basePath: string) {
  return platformNavItems.map(item => ({
    ...item,
    href: `${basePath}${item.href}`,
  }));
}

// Helper function to get icon for a nav item by title
export function getIconForNavItem(title: string): LucideIcon {
  // Handle special cases first
  if (title === 'Onboarding') {
    return Sparkles;
  }
  
  const item = platformNavItems.find(navItem => navItem.title === title);
  return item?.icon || Package;
}