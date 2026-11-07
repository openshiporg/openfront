import { useMemo, useState } from 'react';
import { Minus, Plus, ShoppingCart } from '../vendor/icons';
import { Button, IconButton } from '../vendor/action-button';
import { Segmented } from '../vendor/segmented-control';
import { Checkbox, Radio, RadioGroup } from '../vendor/choice-controls';
import { TextArea } from '../vendor/text-field';
import { Panel, Shell, ShellHeader } from '../vendor/surface';
import type { ProductData } from '../types';
import { callTool, errorMessage, succeeded } from './bridge';
import { Note, money, useBusy } from './ui';

/** Product detail: image, options, price and add to cart, all from TuffUI controls. */
export function ProductCard({ data }: { data: ProductData }) {
  const { product, countryCode } = data;
  const [image, setImage] = useState(0);
  const [chosen, setChosen] = useState<Record<string, string>>(() => {
    const first = product.variants.find((v) => v.inStock) ?? product.variants[0];
    return product.variants.length > 1 && first ? { ...first.optionValues } : {};
  });
  const [selected, setSelected] = useState<string[]>(() => product.restaurant?.groups.flatMap((g) => g.choices.filter((c) => c.defaultSelected).map((c) => c.id)) ?? []);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [note, setNote] = useState<{ tone: 'positive' | 'negative'; text: string } | null>(null);
  const { busy, run } = useBusy();
  const restaurant = product.restaurant;

  const variant = useMemo(() => {
    if (product.variants.length === 1) return product.variants[0];
    if (!product.options.every((o) => chosen[o.id])) return undefined;
    return product.variants.find((v) => product.options.every((o) => v.optionValues[o.id] === chosen[o.id]));
  }, [product, chosen]);

  const modifierTotal = restaurant ? restaurant.groups.flatMap((g) => g.choices).filter((c) => selected.includes(c.id)).reduce((n, c) => n + c.price, 0) : 0;
  const unit = typeof variant?.price === 'number' ? variant.price + modifierTotal : undefined;

  const groupIssue = restaurant?.groups.find((g) => {
    const count = g.choices.filter((c) => selected.includes(c.id)).length;
    return count < g.min || count > g.max;
  });

  const toggle = (groupId: string, id: string, max: number) => {
    const group = restaurant!.groups.find((g) => g.id === groupId)!;
    setSelected((current) => {
      if (current.includes(id)) return current.filter((x) => x !== id);
      const inGroup = group.choices.filter((c) => current.includes(c.id));
      if (max === 1) return [...current.filter((x) => !inGroup.some((c) => c.id === x)), id];
      return inGroup.length >= max ? current : [...current, id];
    });
  };

  const available = restaurant ? restaurant.cartAvailable : true;
  const canAdd = available && Boolean(variant) && variant!.inStock && !groupIssue;
  const label = !available ? 'Cart unavailable' : !variant ? (product.options.every((o) => chosen[o.id]) ? 'Unavailable' : 'Select options')
    : !variant.inStock ? 'Out of stock' : groupIssue ? `Choose ${groupIssue.label}` : 'Add to cart';

  const add = () => run(async () => {
    setNote(null);
    try {
      const response = await callTool('addToCart', {
        variantId: variant!.id,
        quantity,
        countryCode,
        ...(restaurant ? { modifierIds: selected, specialInstructions: instructions.trim(), orderType: 'pickup' } : {}),
      });
      setNote(succeeded(response) ? { tone: 'positive', text: 'Added to the cart.' } : { tone: 'negative', text: errorMessage(response, 'Could not add this item.') });
    } catch (error) {
      setNote({ tone: 'negative', text: error instanceof Error ? error.message : 'Could not add this item.' });
    }
  });

  const facts = restaurant ? [restaurant.prepTime && `${restaurant.prepTime} min`, restaurant.calories && `${restaurant.calories} cal`, ...restaurant.dietaryFlags].filter(Boolean).join(' · ') : '';

  return (
    <Shell aria-label={product.title} className="max-w-xl">
      <ShellHeader icon={ShoppingCart} title={product.title} subtitle={restaurant?.category ?? facts} aside={<span className="font-mono text-sm tabular-nums">{money(unit ?? product.variants[0]?.price, product.currency)}</span>} />
      <Panel>
        <div className="flex flex-col gap-4 p-4 @md:flex-row">
          <div className="@md:w-44 @md:shrink-0">
            {product.images.length ? (
              <img src={product.images[image]} alt={product.title} className="aspect-square w-full rounded-xl bg-foreground/[0.05] object-cover" />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-foreground/[0.05] text-xs text-muted-foreground">No image</div>
            )}
            {product.images.length > 1 && (
              <div className="mt-2 flex gap-1.5 overflow-x-auto">
                {product.images.map((src, i) => (
                  <button key={src} type="button" aria-label={`Image ${i + 1}`} aria-pressed={i === image} onClick={() => setImage(i)} className={`size-10 shrink-0 overflow-hidden rounded-lg ${i === image ? 'ring-2 ring-brand' : 'opacity-70'}`}>
                    <img src={src} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            {restaurant && facts && <p className="text-xs text-muted-foreground">{facts}</p>}
            {product.description && <p className="text-[0.8125rem] text-pretty text-muted-foreground">{product.description}</p>}
            {product.variants.length > 1 && product.options.map((option) => (
              <div key={option.id} className="flex flex-col gap-1.5">
                <span className="label text-muted-foreground">{option.title}</span>
                {option.values.some((v) => v.length > 12) || option.values.length > 5 ? (
                  <RadioGroup label={option.title} value={chosen[option.id] as string | undefined} onValueChange={(v) => setChosen((c) => ({ ...c, [option.id]: v }))}>
                    {option.values.map((value) => <Radio key={value} value={value} label={value} />)}
                  </RadioGroup>
                ) : (
                <Segmented size="sm" label={option.title} value={chosen[option.id] as string | undefined} onValueChange={(v) => setChosen((c) => ({ ...c, [option.id]: v }))} options={option.values.map((value) => ({ value, label: value }))} className="max-w-full flex-wrap" />
                )}
              </div>
            ))}
            {restaurant?.groups.map((group) => (
              <fieldset key={group.id} className="flex min-w-0 flex-col gap-2 border-0 p-0">
                <legend className="mb-1 flex w-full items-baseline justify-between gap-2 text-[0.8125rem] font-medium">
                  <span>{group.label}</span>
                  <span className="text-xs font-normal text-muted-foreground">{group.required ? `Choose ${group.min}` : 'Optional'}{group.max > 1 ? ` · up to ${group.max}` : ''}</span>
                </legend>
                {group.max === 1 && group.required ? (
                  <RadioGroup label={group.label} value={group.choices.find((c) => selected.includes(c.id))?.id} onValueChange={(id) => toggle(group.id, id, 1)}>
                    {group.choices.map((c) => <Radio key={c.id} value={c.id} label={`${c.name}${c.price ? ` · +${money(c.price, product.currency)}` : ''}`} />)}
                  </RadioGroup>
                ) : group.choices.map((c) => (
                  <Checkbox key={c.id} checked={selected.includes(c.id)} onCheckedChange={() => toggle(group.id, c.id, group.max)} label={`${c.name}${c.price ? ` · +${money(c.price, product.currency)}` : ''}`} />
                ))}
              </fieldset>
            ))}
            {restaurant && <TextArea label="Special instructions" placeholder="Sauce on the side, no onions…" value={instructions} onChange={(e) => setInstructions(e.target.value)} maxLength={500} />}
            <div className="flex items-center gap-2 pt-1">
              {restaurant && (
                <div role="group" aria-label="Quantity" className="flex items-center gap-1 rounded-full bg-foreground/[0.05] p-0.5">
                  <IconButton icon={Minus} iconWeight="bold" label="Decrease" variant="quiet" className="size-7" disabled={quantity <= 1} onClick={() => setQuantity((q) => Math.max(1, q - 1))} />
                  <span className="w-5 text-center font-mono text-xs tabular-nums">{quantity}</span>
                  <IconButton icon={Plus} iconWeight="bold" label="Increase" variant="quiet" className="size-7" disabled={quantity >= 25} onClick={() => setQuantity((q) => Math.min(25, q + 1))} />
                </div>
              )}
              <Button variant="primary" size="md" icon={ShoppingCart} loading={busy} disabled={!canAdd} onClick={add} className="min-w-0 flex-1">
                {label}{canAdd && unit !== undefined && restaurant ? ` · ${money(unit * quantity, product.currency)}` : ''}
              </Button>
            </div>
          </div>
        </div>
      </Panel>
      {note && <Note tone={note.tone}>{note.text}</Note>}
    </Shell>
  );
}
