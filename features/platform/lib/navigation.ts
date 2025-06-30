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
  Layers
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
  // Orders & Fulfillment
  {
    title: 'Orders',
    href: '/platform/orders',
    color: 'blue',
    description: 'Manage customer orders, returns, claims, and fulfillment.',
    icon: Ticket,
    group: 'orders'
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
    title: 'Pricing & Promotions',
    href: '/platform/pricing',
    color: 'pink',
    description: 'Manage discounts, price lists, gift cards, and promotional campaigns.',
    icon: Tag,
    group: 'marketing'
  },
  {
    title: 'Analytics',
    href: '/platform/analytics',
    color: 'indigo',
    description: 'View sales reports, customer insights, and business performance metrics.',
    icon: BarChart3,
    group: 'marketing'
  },

  // Operations & Config
  {
    title: 'Shipping',
    href: '/platform/shipping',
    color: 'sky',
    description: 'Configure shipping options, fulfillment providers, and delivery methods.',
    icon: Truck,
    group: 'operations'
  },
  {
    title: 'Regional Settings',
    href: '/platform/regions',
    color: 'blue',
    description: 'Manage regions, countries, currencies, and tax configurations.',
    icon: Globe,
    group: 'operations'
  },

  // System & Settings
  {
    title: 'System Configuration',
    href: '/platform/system',
    color: 'zinc',
    description: 'Configure system settings, stores, and payment providers.',
    icon: Settings,
    group: 'system'
  },
];

// Organized navigation groups following e-commerce best practices
export const platformNavGroups: PlatformNavGroup[] = [
  {
    id: 'orders',
    title: 'Orders',
    icon: Ticket,
    items: platformNavItems.filter(item => item.group === 'orders')
  },
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
    id: 'operations',
    title: 'Operations',
    icon: Settings,
    items: platformNavItems.filter(item => item.group === 'operations')
  },
  {
    id: 'system',
    title: 'Settings',
    icon: Layers,
    items: platformNavItems.filter(item => item.group === 'system')
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