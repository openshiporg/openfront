import type { SlimProduct } from '../types';
import { renderMcpCard } from './shell';

const dollars = (minor: unknown) => (typeof minor === 'number' && Number.isFinite(minor) ? minor / 100 : undefined);
const http = (value: unknown, base: string) => {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  try {
    const url = new URL(String(value ?? ''), base);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
};
const text = (document: unknown): string | undefined => {
  // Keystone document field: flatten paragraph nodes to plain text.
  const walk = (n: any): string => (Array.isArray(n) ? n.map(walk).join(' ') : n?.text ?? (n?.children ? walk(n.children) : ''));
  const out = typeof document === 'string' ? document : walk(document);
  return out.replace(/\s+/g, ' ').trim() || undefined;
};

/** Reduce an Openfront GraphQL product (productVariants/prices/productOptionValues) to the display-only card shape. */
export function slimOpenfrontProduct(p: any, origin: string): SlimProduct {
  const options = new Map<string, Set<string>>();
  for (const v of p.productVariants ?? []) {
    for (const pov of v.productOptionValues ?? []) {
      const name = String(pov.productOption?.title ?? '').trim();
      const value = String(pov.value ?? '').trim();
      if (!name || !value) continue;
      if (!options.has(name)) options.set(name, new Set());
      options.get(name)!.add(value);
    }
  }
  const optionId = (name: string) => `opt_${p.id}_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
  const price = (v: any) => v.prices?.[0];
  const currency = (p.productVariants ?? []).map((v: any) => price(v)?.currency?.code).find(Boolean) || 'USD';
  const images = [p.thumbnail, ...(p.productImages ?? []).map((i: any) => i?.image?.url)].map((u) => http(u, origin)).filter((u): u is string => !!u);
  return {
    id: String(p.id),
    title: String(p.title ?? ''),
    description: text(p.description?.document),
    images: Array.from(new Set(images)),
    currency,
    options: Array.from(options, ([title, values]) => ({ id: optionId(title), title, values: [...values] })),
    variants: (p.productVariants ?? []).map((v: any) => ({
      id: String(v.id),
      title: String(v.title ?? ''),
      price: dollars(price(v)?.calculatedPrice?.calculatedAmount ?? price(v)?.amount),
      inStock: (v.inventoryQuantity ?? 0) > 0 || !!v.allowBackorder,
      optionValues: Object.fromEntries((v.productOptionValues ?? []).map((pov: any) => [optionId(String(pov.productOption?.title ?? '').trim()), String(pov.value ?? '').trim()])),
    })),
  };
}

export function productsCardHtml(products: any[], origin: string, countryCode: string, storeName?: string, query?: string) {
  const slim = products.map((p) => slimOpenfrontProduct(p, origin));
  return renderMcpCard({
    kind: 'discover',
    data: { title: [storeName, query].filter(Boolean).join(' · ') || 'Products', stores: [{ storeId: '', name: 'Products', countryCode, currency: slim[0]?.currency ?? 'USD', products: slim }] },
  }, 'Products', origin);
}

export function productCardHtml(product: any, origin: string, countryCode: string) {
  const slim = slimOpenfrontProduct(product, origin);
  return renderMcpCard({ kind: 'product', data: { storeId: '', countryCode, product: slim } }, slim.title, origin);
}
