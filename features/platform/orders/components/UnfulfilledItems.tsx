import { Plus, Minus } from 'lucide-react';
import { ProductImage } from '../../components/ProductImage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UnfulfilledItemProps, UnfulfilledItemsProps } from '../types';
import { badgeVariants } from '@/components/ui/badge-button';
import { cn } from '@/lib/utils';

function UnfulfilledItem({
  item,
  quantity,
  onQuantityChange,
}: UnfulfilledItemProps) {
  return (
    <div className="flex items-start space-x-4 p-2 border-t first:border-t-0">
      <div className="h-16 w-16 flex-shrink-0">
        <ProductImage
          src={item.thumbnail}
          alt={item.title}
          width={64}
          height={64}
          className="h-16 w-16"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h4 className="font-medium text-sm">{item.title}</h4>
            {item.variantTitle && (
              <p className="text-xs text-muted-foreground mb-1">
                {item.variantTitle}
                {item.sku && <span className="ml-1">∙ SKU: {item.sku}</span>}
              </p>
            )}
            <div className="flex items-center gap-2">
              {item.sku && (
                <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
              )}
              <div
                className={cn(
                  badgeVariants({ color: 'rose' }),
                  'border py-0 text-[11px] uppercase font-medium tracking-wide rounded-full'
                )}
              >
                Unfulfilled
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {item.quantity} × {item.formattedUnitPrice}
              </div>
              <div className="text-sm font-medium whitespace-nowrap">
                {item.formattedTotal}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
                disabled={quantity === 0}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <div className="flex items-center gap-1 text-xs font-medium tabular-nums">
                <span aria-label={`Current quantity is ${quantity}`}>
                  {quantity}
                </span>
                <span className="text-muted-foreground">
                  of {item.quantity}
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() =>
                  onQuantityChange(Math.min(item.quantity, quantity + 1))
                }
                disabled={quantity === item.quantity}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UnfulfilledItems({
  items,
  selectedQuantities,
  setSelectedQuantities,
}: UnfulfilledItemsProps) {
  return (
    <Card className="bg-muted/10">
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between border-b">
        <CardTitle className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
          Unfulfilled Items
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-1">
        {items.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.map((item) => (
              <UnfulfilledItem
                key={item.id}
                item={item}
                selected={parseInt(selectedQuantities[item.id] || '0') > 0}
                quantity={parseInt(selectedQuantities[item.id] || '0')}
                onQuantityChange={(quantity) =>
                  setSelectedQuantities({
                    ...selectedQuantities,
                    [item.id]: quantity.toString(),
                  })
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex h-44 items-center justify-center rounded-lg border bg-muted/40 p-4 my-3">
            <div className="text-center">
              <Package
                className="mx-auto h-7 w-7 text-muted-foreground/50"
                aria-hidden="true"
              />
              <p className="mt-2 text-sm font-medium">
                Please select at least 1 item to fulfill
              </p>
              <p className="text-sm text-muted-foreground">
                Select items from the list to begin fulfillment
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}