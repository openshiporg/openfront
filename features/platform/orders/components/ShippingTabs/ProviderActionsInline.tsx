'use client';

import { Plus, PenSquare, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ShippingProvider } from '../../types';
import { ReactNode, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { deleteProvider } from "@/features/platform/orders/actions";

interface ProviderActionsInlineProps {
  provider: ShippingProvider;
  onProviderToggle: (providerId: string) => Promise<void>;
  children?: ReactNode;
  onDelete?: (provider: ShippingProvider) => void;
}

export function ProviderActionsInline({
  provider,
  onProviderToggle,
  children,
  onDelete,
}: ProviderActionsInlineProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteProvider = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteProvider(provider.id);

      if (response.success) {
        toast.success(`Deleted provider ${provider.name} successfully`);
        // If the provider was deleted successfully, call onDelete callback
        onDelete?.(provider);
      } else {
        console.error(`Failed to delete provider ${provider.name}:`, response.error);
        toast.error(`Failed to delete provider: ${provider.name}`, {
          description: response.error || 'An unexpected error occurred'
        });
      }
    } catch (error) {
      // Catch any unexpected errors during the async operation itself (not from Keystone)
      console.error('An unexpected error occurred during provider deletion:', error);
      toast.error(`An unexpected error occurred while deleting ${provider.name}`, {
        description: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      {children && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => onProviderToggle(provider.id)}
              className="gap-2 font-medium tracking-wide text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              {provider?.isActive ? 'DEACTIVATE' : 'ACTIVATE'}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                // Open edit dialog or sheet here
                // For now, we'll just show a toast since we need to implement a proper edit dialog
                toast.info('Edit provider functionality needs to be implemented');
              }}
              className="gap-2 font-medium tracking-wide text-xs"
            >
              <PenSquare className="h-3.5 w-3.5" />
              EDIT PROVIDER
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              className="gap-2 font-medium tracking-wide text-xs text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
              DELETE PROVIDER
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Provider</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the provider &quot;{provider?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProvider} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}