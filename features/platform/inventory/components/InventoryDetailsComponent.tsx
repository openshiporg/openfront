'use client';

import React, { useState } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { MoreVertical, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EditItemDrawerClientWrapper } from '../../components/EditItemDrawerClientWrapper';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface InventoryDetailsComponentProps {
  inventory: any;
  list: any;
}

const statusConfig = {
  in_stock: { label: 'In Stock', color: 'emerald', icon: Package },
  low_stock: { label: 'Low Stock', color: 'yellow', icon: AlertTriangle },
  out_of_stock: { label: 'Out of Stock', color: 'red', icon: Package },
  backordered: { label: 'Backordered', color: 'purple', icon: TrendingUp },
};

export function InventoryDetailsComponent({ inventory, list }: InventoryDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  
  const status = inventory.status || 'in_stock';
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.in_stock;
  const Icon = config.icon;

  const availableQuantity = inventory.quantity - inventory.reservedQuantity;
  const totalPotential = inventory.quantity + inventory.incomingQuantity;

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={inventory.id} className="border-0">
          <div className="px-4 md:px-6 py-3 md:py-4 flex justify-between w-full border-b relative min-h-[80px]">
            <div className="flex items-start gap-4">
              {/* Status Icon */}
              <div className={cn(
                "w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center",
                status === 'in_stock' && "bg-emerald-100 dark:bg-emerald-900/20",
                status === 'low_stock' && "bg-yellow-100 dark:bg-yellow-900/20",
                status === 'out_of_stock' && "bg-red-100 dark:bg-red-900/20",
                status === 'backordered' && "bg-purple-100 dark:bg-purple-900/20"
              )}>
                <Icon className={cn(
                  "h-6 w-6",
                  status === 'in_stock' && "text-emerald-600 dark:text-emerald-400",
                  status === 'low_stock' && "text-yellow-600 dark:text-yellow-400",
                  status === 'out_of_stock' && "text-red-600 dark:text-red-400",
                  status === 'backordered' && "text-purple-600 dark:text-purple-400"
                )} />
              </div>

              {/* Inventory Info */}
              <div className="flex flex-col items-start text-left gap-2 sm:gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/dashboard/platform/inventory/${inventory.id}`}
                    className="font-medium text-base hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {inventory.sku || 'No SKU'}
                  </Link>
                  <span>‧</span>
                  <span className="text-sm font-medium">
                    <span className="text-muted-foreground/75">
                      {format(new Date(inventory.updatedAt), 'MMM d, yyyy')}
                    </span>
                  </span>
                </div>
                
                {/* Product/Variant Info */}
                {(inventory.product || inventory.variant) && (
                  <p className="text-sm text-muted-foreground">
                    {inventory.product?.title}
                    {inventory.variant && ` - ${inventory.variant.title}`}
                  </p>
                )}

                {/* Quantity Summary */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{inventory.quantity}</span>
                    <span>on hand</span>
                  </div>
                  <span>‧</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">{availableQuantity}</span>
                    <span>available</span>
                  </div>
                  <span>‧</span>
                  <span>Location: {inventory.location || 'Default'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between h-full">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn(
                  "text-xs",
                  status === 'in_stock' && "border-emerald-500 text-emerald-700 dark:text-emerald-400",
                  status === 'low_stock' && "border-yellow-500 text-yellow-700 dark:text-yellow-400",
                  status === 'out_of_stock' && "border-red-500 text-red-700 dark:text-red-400",
                  status === 'backordered' && "border-purple-500 text-purple-700 dark:text-purple-400"
                )}>
                  {config.label}
                </Badge>
                
                {/* Action buttons */}
                <div className="absolute bottom-3 right-5 sm:static flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="border [&_svg]:size-3 h-6 w-6"
                    onClick={() => setIsEditDrawerOpen(true)}
                  >
                    <MoreVertical className="stroke-muted-foreground" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="border [&_svg]:size-3 h-6 w-6"
                    asChild
                  >
                    <AccordionTrigger className="py-0" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <AccordionContent className="pb-0">
            <div className="divide-y">
              {/* Quantity Details */}
              <div className="px-4 md:px-6 py-4">
                <h4 className="text-sm font-medium mb-3">Inventory Details</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">On Hand</p>
                    <p className="text-sm font-medium">{inventory.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Reserved</p>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      {inventory.reservedQuantity}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Available</p>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      {availableQuantity}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Incoming</p>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {inventory.incomingQuantity}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="px-4 md:px-6 py-4">
                <h4 className="text-sm font-medium mb-3">Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">SKU:</span>
                    <span className="ml-2 font-medium">{inventory.sku || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location:</span>
                    <span className="ml-2 font-medium">{inventory.location || 'Default'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <span className="ml-2 font-medium">{config.label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="ml-2 font-medium">
                      {format(new Date(inventory.updatedAt), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <EditItemDrawerClientWrapper
        listKey="inventory"
        itemId={inventory.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
      />
    </>
  );
}