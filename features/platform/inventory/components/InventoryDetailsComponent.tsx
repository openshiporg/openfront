'use client';

import { useState } from 'react';
import { MoreVertical, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EditItemDrawer } from '../../components/EditItemDrawer';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
      <div className="group hover:bg-muted/50 transition-colors px-4 md:px-6 py-4">
        <div className="flex items-start gap-4">
          {/* Status Icon */}
          <div className={cn(
            "p-2 rounded-lg",
            status === 'in_stock' && "bg-emerald-100 dark:bg-emerald-900/20",
            status === 'low_stock' && "bg-yellow-100 dark:bg-yellow-900/20",
            status === 'out_of_stock' && "bg-red-100 dark:bg-red-900/20",
            status === 'backordered' && "bg-purple-100 dark:bg-purple-900/20"
          )}>
            <Icon className={cn(
              "h-5 w-5",
              status === 'in_stock' && "text-emerald-600 dark:text-emerald-400",
              status === 'low_stock' && "text-yellow-600 dark:text-yellow-400",
              status === 'out_of_stock' && "text-red-600 dark:text-red-400",
              status === 'backordered' && "text-purple-600 dark:text-purple-400"
            )} />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-base">
                    {inventory.sku || 'No SKU'}
                  </h3>
                  <Badge variant="outline" className={cn(
                    "text-xs",
                    status === 'in_stock' && "border-emerald-500 text-emerald-700 dark:text-emerald-400",
                    status === 'low_stock' && "border-yellow-500 text-yellow-700 dark:text-yellow-400",
                    status === 'out_of_stock' && "border-red-500 text-red-700 dark:text-red-400",
                    status === 'backordered' && "border-purple-500 text-purple-700 dark:text-purple-400"
                  )}>
                    {config.label}
                  </Badge>
                </div>
                
                {/* Product/Variant Info */}
                {(inventory.product || inventory.variant) && (
                  <p className="text-sm text-muted-foreground">
                    {inventory.product?.title}
                    {inventory.variant && ` - ${inventory.variant.title}`}
                  </p>
                )}

                {/* Location */}
                <p className="text-sm text-muted-foreground">
                  Location: {inventory.location || 'Default'}
                </p>
              </div>

              {/* Actions */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditDrawerOpen(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>

            {/* Quantity Details */}
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
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

            {/* Updated timestamp */}
            <p className="text-xs text-muted-foreground mt-2">
              Last updated {format(new Date(inventory.updatedAt), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
      </div>

      <EditItemDrawer
        isOpen={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        itemData={inventory}
        listConfig={list}
        onSave={() => {
          setIsEditDrawerOpen(false);
          window.location.reload();
        }}
      />
    </>
  );
}