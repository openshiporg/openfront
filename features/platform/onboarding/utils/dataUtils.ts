import { STORE_TEMPLATES } from '../config/templates';

// Helper function to extract display items from JSON data
export function getItemsFromJsonData(jsonData: any, sectionType: string): string[] {
  if (!jsonData) return [];

  switch (sectionType) {
    case 'store':
      return jsonData.store ? [jsonData.store.name || 'Unknown Store'] : ['Impossible Tees'];
    case 'regions':
      return (jsonData.regions || []).map((r: any) =>
        `${r.name || 'Unknown'} (${(r.currencyCode || 'USD').toUpperCase()})`
      );
    case 'paymentProviders':
      return (jsonData.paymentProviders || []).map((p: any) => p.name || 'Unknown Provider');
    case 'shipping':
      return (jsonData.shipping_options || []).map((s: any) => s.name || 'Unknown Shipping');
    case 'categories':
      return (jsonData.categories || []).map((c: any) => c.title || c.name || 'Unknown Category');
    case 'collections':
      return (jsonData.collections || []).map((c: any) => c.title || c.name || 'Unknown Collection');
    case 'products':
      return (jsonData.products || []).map((p: any) => p.title || 'Unknown Product');
    default:
      return [];
  }
}

// Helper to get the right slice of seed data for a template
export function getSeedForTemplate(template: 'full' | 'minimal' | 'custom', seedData: any, customData?: Record<string, string[]>) {
  const templateToUse = template === 'custom' ? 'minimal' : template;
  const tpl = STORE_TEMPLATES[templateToUse];

  // Get the region codes for this template
  const templateRegionCodes = tpl.regions;

  // Filter products and clean up variant prices to only include relevant regions
  const filteredProducts = (seedData.products as any[])
    .filter((p: any) => tpl.products.includes(p.handle))
    .map((product: any) => ({
      ...product,
      variants: product.variants.map((variant: any) => ({
        ...variant,
        prices: variant.prices.filter((price: any) =>
          templateRegionCodes.includes(price.regionCode)
        )
      }))
    }));

  return {
    regions: (seedData.regions as any[]).filter((r: any) =>
      tpl.regions.includes(r.code)
    ),
    paymentProviders: (seedData.paymentProviders as any[]).filter((p: any) =>
      tpl.paymentProviders.includes(p.code)
    ),
    shipping_options: (seedData.shipping_options as any[]).filter((s: any) =>
      tpl.shipping.includes(s.name)
    ),
    categories: (seedData.categories as any[]).filter((c: any) =>
      tpl.categories.includes(c.handle)
    ),
    collections: (seedData.collections as any[]).filter((c: any) =>
      tpl.collections.includes(c.handle)
    ),
    products: filteredProducts,
  };
}