import { useState } from 'react';
import { ResultCarousel, type ResultItem } from '../vendor/result-carousel';
import type { DiscoverData, SlimProduct } from '../types';
import { callTool, errorMessage, succeeded } from './bridge';
import { Note, money } from './ui';

const cheapest = (p: SlimProduct) => {
  const prices = p.variants.map((v) => v.price).filter((n): n is number => typeof n === 'number');
  return prices.length ? Math.min(...prices) : undefined;
};

/** Product search results: TuffUI result-carousel, one per source. */
export function DiscoverCard({ data }: { data: DiscoverData }) {
  const [note, setNote] = useState<{ tone: 'positive' | 'negative'; text: string } | null>(null);
  const multi = data.stores.length > 1;

  const open = (storeIdx: number, product: SlimProduct) => {
    const store = data.stores[storeIdx];
    callTool('getProduct', { productId: product.id, countryCode: store.countryCode }).catch(() => {});
  };

  const act = async (storeIdx: number, product: SlimProduct) => {
    const store = data.stores[storeIdx];
    const needsChoice = product.variants.length !== 1 || (product.restaurant?.groups.length ?? 0) > 0 || product.restaurant?.cartAvailable === false;
    if (needsChoice) return open(storeIdx, product);
    setNote(null);
    try {
      const response = await callTool('addToCart', { variantId: product.variants[0].id, quantity: 1, countryCode: store.countryCode });
      setNote(succeeded(response)
        ? { tone: 'positive', text: `Added ${product.title} to the cart.` }
        : { tone: 'negative', text: errorMessage(response, 'Could not add this item.') });
    } catch (error) {
      setNote({ tone: 'negative', text: error instanceof Error ? error.message : 'Could not add this item.' });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {data.stores.map((store, storeIdx) => {
        const items: ResultItem[] = store.products.map((p, productIdx) => {
          const low = cheapest(p);
          const several = p.variants.length > 1;
          const needsChoice = several || (p.restaurant?.groups.length ?? 0) > 0;
          return {
            id: `${storeIdx}:${productIdx}`,
            title: p.title,
            meta: p.restaurant?.category ?? (several ? `${p.variants.length} options` : undefined),
            price: low === undefined ? undefined : `${several ? 'From ' : ''}${money(low, p.currency)}`,
            image: p.images[0],
            action: p.restaurant?.cartAvailable === false ? 'View details' : needsChoice ? (p.restaurant ? 'Customize' : 'Choose options') : 'Add to cart',
          };
        });
        const find = (item: ResultItem) => {
          const [, productIdx] = item.id.split(':').map(Number);
          return store.products[productIdx];
        };
        return (
          <ResultCarousel
            key={store.storeId}
            title={store.name}
            subtitle={multi ? `${store.platform === 'openfront-restaurant' ? 'Menu' : 'Products'} · ${store.currency}` : data.title}
            data={items}
            onAction={(item) => act(storeIdx, find(item))}
            onOpen={(item) => open(storeIdx, find(item))}
          />
        );
      })}
      {note && <Note tone={note.tone}>{note.text}</Note>}
    </div>
  );
}
