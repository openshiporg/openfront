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

interface ReverseOAuthInstallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: (openshipUrl: string) => void;
  app: {
    id: string;
    name: string;
    description?: string;
    scopes: string[];
    clientId: string;
    clientSecret: string;
  };
}

export const ReverseOAuthInstallDialog: React.FC<ReverseOAuthInstallDialogProps> = ({
  isOpen,
  onClose,
  onInstall,
  app,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [openshipUrl, setOpenshipUrl] = useState('');

  const handleInstall = async () => {
    if (!openshipUrl.trim()) return;
    
    try {
      setIsProcessing(true);
      
      // Clean up OpenShip URL
      let cleanUrl = openshipUrl.trim()
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = `https://${cleanUrl}`
      }
      cleanUrl = cleanUrl.replace(/\/$/, '') // Remove trailing slash

      // Create OAuth token and redirect directly to Openship (like the working dialog does)  
      const { createOAuthToken } = await import('../../order-management-system/actions/oauth');
      
      await createOAuthToken(
        app.clientId,
        app.scopes.join(' '),
        `${cleanUrl}/api/oauth/reverse-callback`, // User-entered Openship URL
        JSON.stringify({ // Pass app details in state as JSON
          clientId: app.clientId,
          clientSecret: app.clientSecret,
          appName: app.name
        })
      );
    } catch (err) {
      console.error('Failed to install:', err);
      setIsProcessing(false);
    }
  };

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

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div>
              <DialogTitle>Install {app.name}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Review the permissions being requested
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Domain Input */}
          <div>
            <Label htmlFor="openship-url">Openship URL</Label>
            <Input
              id="openship-url"
              value={openshipUrl}
              onChange={(e) => setOpenshipUrl(e.target.value)}
              placeholder="https://openship.mydomain.com"
              disabled={isProcessing}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter the full URL where your Openship instance is hosted
            </p>
          </div>

          {/* Permissions */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This application is requesting access to your OpenFront store with the following permissions:
            </p>
            
            <div className="border shadow-inner bg-muted/40 rounded-lg p-4 space-y-2">
              {app.scopes.map((scope) => (
                <div key={scope} className="flex items-center gap-2">
                  <CircleCheck className="w-4 h-4 text-green-600" />
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

        <DialogFooter>
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInstall}
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