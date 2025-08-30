'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CircleCheck, Loader2, Settings } from 'lucide-react';
import { createOAuthToken, denyOAuthApp } from '../actions/oauth';

interface OAuthParams {
  clientId: string;
  scope: string;
  redirectUri: string;
  state: string;
  responseType: string;
}

interface OAuthInstallDialogClientProps {
  isOpen: boolean;
  oauthParams: OAuthParams;
  initialData: {
    success: boolean;
    app?: any;
    requestedScopes?: string[];
    error?: string;
  };
}

export const OAuthInstallDialogClient: React.FC<OAuthInstallDialogClientProps> = ({
  isOpen,
  oauthParams,
  initialData,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleClose = () => {
    // Clear search params to close the dialog
    router.replace('/dashboard/platform/apps');
  };

  const handleAuthorize = async () => {
    try {
      setIsProcessing(true);
      await createOAuthToken(
        oauthParams.clientId,
        oauthParams.scope,
        oauthParams.redirectUri,
        oauthParams.state
      );
    } catch (err) {
      console.error('Failed to authorize:', err);
      setIsProcessing(false);
    }
  };

  const handleDeny = async () => {
    try {
      setIsProcessing(true);
      await denyOAuthApp(oauthParams.redirectUri, oauthParams.state);
    } catch (err) {
      console.error('Failed to deny:', err);
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()} modal>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {/* <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div> */}
            <div>
              <DialogTitle>
                {initialData.success && initialData.app 
                  ? `Install ${initialData.app.name}` 
                  : 'Installation Required'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {initialData.success 
                  ? 'Review the permissions being requested' 
                  : 'Unable to process authorization'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          {!initialData.success ? (
            <div className="text-center py-4">
              <p className="text-red-600 dark:text-red-400">{initialData.error}</p>
            </div>
          ) : initialData.app ? (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                This application is requesting access to your OpenFront store with the following permissions:
              </p>
              
              <div className="border shadow-inner bg-muted/40 rounded-lg p-4 space-y-2">
                {initialData.requestedScopes?.map((scope) => (
                  <div key={scope} className="flex items-center gap-2">
                    <CircleCheck className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{getScopeDescription(scope)}</span>
                  </div>
                ))}
              </div>

              {initialData.app.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                  {initialData.app.description}
                </p>
              )}
            </>
          ) : null}
        </div>

        <DialogFooter>
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAuthorize}
              disabled={isProcessing || !initialData.success}
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