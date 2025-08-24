'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CircleCheck, Loader2 } from 'lucide-react';
import { createOpenshipOAuthApp } from '../actions';
import { createOAuthToken } from '../../order-management-system/actions/oauth';

interface MarketplaceApp {
  id: string;
  title: string;
  description: string;
  type: 'shop' | 'channel';
}

interface MarketplaceInstallDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  app: MarketplaceApp | null;
}

export const MarketplaceInstallDialog: React.FC<MarketplaceInstallDialogProps> = ({
  isOpen,
  onOpenChange,
  app,
}) => {
  const [openshipUrl, setOpenshipUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const getScopeDescription = (scope: string): string => {
    const descriptions: Record<string, string> = {
      read_products: 'Read your products',
      write_products: 'Manage your products',
      read_orders: 'Read your orders',
      write_orders: 'Manage your orders',
      read_customers: 'Read your customers',
      write_customers: 'Manage your customers',
      read_webhooks: 'Read your webhooks',
      write_webhooks: 'Manage your webhooks',
    };
    return descriptions[scope] || `Access to ${scope}`;
  };

  const scopes = [
    'read_products',
    'write_products', 
    'read_orders',
    'write_orders',
    'read_customers',
    'write_customers',
    'read_webhooks',
    'write_webhooks'
  ];

  const handleAuthorize = async () => {
    if (!app || !openshipUrl.trim()) return;
    
    setIsProcessing(true);
    
    try {
      const result = await createOpenshipOAuthApp({
        appType: app.id as 'openship-shop' | 'openship-channel',
        openshipUrl: openshipUrl.trim()
      });

      if (result.success) {
        const state = JSON.stringify({
          type: 'marketplace',
          client_id: result.data.clientId,
          client_secret: result.data.clientSecret,
          app_name: app?.title,
          app_type: app?.type, // Include app type for proper routing
          adapter_slug: 'openfront',
          nonce: crypto.randomUUID()
        });

        await createOAuthToken(
          result.data.clientId,
          scopes.join(' '),
          result.data.redirectUri,
          state
        );
      }
    } catch (err) {
      console.error('Failed to authorize:', err);
      setIsProcessing(false);
    }
  };


  if (!isOpen || !app) return null;

  return (
    <Dialog open={isOpen} modal>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div>
              <DialogTitle>Install {app.title}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Review the permissions being requested
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="openship-url">Openship URL</Label>
              <Input
                id="openship-url"
                value={openshipUrl}
                onChange={(e) => setOpenshipUrl(e.target.value)}
                placeholder="https://openship.mydomain.com"
                disabled={isProcessing}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the full URL where your Openship instance is hosted
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                This application is requesting access to your OpenFront store with the following permissions:
              </p>
              
              <div className="border shadow-inner bg-muted/40 rounded-lg p-4 space-y-2">
                {scopes.map((scope) => (
                  <div key={scope} className="flex items-center gap-2">
                    <CircleCheck className="w-4 h-4 text-zinc-600" />
                    <span className="text-sm">{getScopeDescription(scope)}</span>
                  </div>
                ))}
              </div>

              {app.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                  {app.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAuthorize}
              disabled={isProcessing || !openshipUrl.trim()}
              className="flex-1"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Install
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};