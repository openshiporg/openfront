'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Triangle, Square, Circle, CircleSlash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UnfulfilledItems } from '../components/UnfulfilledItems';
import { FulfillmentHistory } from '../components/FulfillmentHistory';
import { ShippingTabs } from '../components/ShippingTabs';
import { cancelFulfillment, toggleProvider } from '@/features/platform/orders/actions';
import { notFound } from 'next/navigation';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Order } from '../types';

interface FulfillOrderClientProps {
  order: Order;
}

export function FulfillOrderClient({ order }: FulfillOrderClientProps) {
  const router = useRouter();
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  if (!order) {
    return notFound();
  }

  const handleProviderToggle = async (providerId: string) => {
    setIsLoading(true);
    const response = await toggleProvider(providerId);

    if (response.success) {
      toast.success('Provider status updated successfully');
      router.refresh();
    } else {
      console.error('Failed to toggle provider:', response.error, response.errors);
      toast.error('Failed to update provider', {
        description: response.error
      });
    }
    setIsLoading(false);
  };

  const handleDeleteFulfillment = async (id: string) => {
    setIsLoading(true);
    const response = await cancelFulfillment(id);

    if (response.success) {
      toast.success('Fulfillment cancelled successfully');
      router.refresh();
    } else {
      console.error('Failed to cancel fulfillment:', response.error, response.errors);
      toast.error('Failed to cancel fulfillment', {
        description: response.error
      });
    }
    setIsLoading(false);
  };

  const handleCancelAll = async () => {
    setIsLoading(true);
    const activeFulfillments = order.fulfillmentDetails?.filter(f => !f.canceledAt) || [];
    
    for (const fulfillment of activeFulfillments) {
      await handleDeleteFulfillment(fulfillment.id);
    }
    setIsLoading(false);
  };

  const unfulfilledItems = order.unfulfilled || [];
  const isFullyFulfilled = unfulfilledItems.length === 0;

  return (
    <div className="bg-muted/5">
      <div className="max-w-6xl p-4 md:p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Button variant="link" className="p-0 h-5">
              <Link
                href={`/dashboard/platform/orders/${order.id}`}
                className="flex items-center text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Order Details
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-semibold">Fulfill Order</h1>
          <p className="text-sm text-muted-foreground">
            Order #{order.displayId} •{" "}
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {isFullyFulfilled ? (
              <div className="flex h-44 items-center justify-center rounded-lg border bg-muted/40 p-4 my-3">
                <div className="text-center">
                  <div className="relative h-11 w-11 mx-auto mb-2">
                    <Triangle className="absolute left-1 top-1 w-4 h-4 fill-indigo-200 stroke-indigo-400 dark:stroke-indigo-600 dark:fill-indigo-950 rotate-[90deg]" />
                    <Square className="absolute right-[.2rem] top-1 w-4 h-4 fill-orange-300 stroke-orange-500 dark:stroke-amber-600 dark:fill-amber-950 rotate-[30deg]" />
                    <Circle className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 fill-emerald-200 stroke-emerald-400 dark:stroke-emerald-600 dark:fill-emerald-900" />
                  </div>
                  <p className="mt-2 text-sm font-medium">
                    All items have been fulfilled
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Check fulfillments below for details
                  </p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="[&_svg]:size-3 h-7 mt-2"
                        disabled={isLoading}
                      >
                        <CircleSlash className="mr-1" />
                        Start Over
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[250px] p-3" side="bottom">
                      <div className="space-y-2.5">
                        <div className="space-y-1">
                          <p className="text-[13px] font-medium">
                            Cancel all fulfillments?
                          </p>
                          <p className="text-xs text-muted-foreground">
                            This will cancel all active fulfillments.
                          </p>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={handleCancelAll}
                            disabled={isLoading}
                          >
                            Cancel All
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            ) : (
              <UnfulfilledItems
                items={unfulfilledItems}
                selectedQuantities={selectedQuantities}
                setSelectedQuantities={setSelectedQuantities}
                order={order}
              />
            )}
            {order.fulfillmentDetails && order.fulfillmentDetails.length > 0 && (
              <FulfillmentHistory
                fulfillments={order.fulfillmentDetails}
                order={{
                  id: order.id,
                  unfulfilled: order.unfulfilled?.map(item => ({
                    id: item.id,
                    quantity: item.quantity,
                  })) || []
                }}
                onDelete={handleDeleteFulfillment}
              />
            )}
          </div>

          {!isFullyFulfilled && (
            <div className="lg:col-span-4 space-y-6">
              <div className="lg:sticky lg:top-6">
                <ShippingTabs
                  order={order}
                  onProviderToggle={handleProviderToggle}
                  selectedQuantities={selectedQuantities}
                  setSelectedQuantities={setSelectedQuantities}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 