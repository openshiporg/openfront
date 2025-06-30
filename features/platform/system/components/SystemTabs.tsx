"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Store, CreditCard } from "lucide-react";

export type TabType = 'settings' | 'stores' | 'payment-providers';

interface SystemTabsProps {
  initialTab?: TabType;
  list: any;
}

export function SystemTabs({
  initialTab = 'settings',
  list
}: SystemTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Get active tab from URL or use initial
  const activeTab = (searchParams.get('tab') as TabType) || initialTab;
  
  // Handle tab change with URL manipulation
  const handleTabChange = (tab: TabType) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (tab === 'settings') {
      // Remove tab param for default tab
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    
    // Keep other params like search, page, etc.
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newUrl);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
          
          <TabsTrigger value="stores" className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            <span className="hidden sm:inline">Stores</span>
          </TabsTrigger>
          
          <TabsTrigger value="payment-providers" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Payment</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-6">
          <div className="text-center py-8 space-y-4">
            <Settings className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">System Settings</h3>
              <p className="text-muted-foreground">
                Configure platform settings, integrations, and system preferences.
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Settings management will be implemented based on specific configuration needs.
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stores" className="mt-6">
          <div className="text-center py-8 space-y-4">
            <Store className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">Store Configuration</h3>
              <p className="text-muted-foreground">
                Configure store settings, templates, and multi-store setup.
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Store management will use the same patterns as other platform entities.
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payment-providers" className="mt-6">
          <div className="text-center py-8 space-y-4">
            <CreditCard className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">Payment Providers</h3>
              <p className="text-muted-foreground">
                Manage payment gateways and processing configurations.
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Payment provider management will follow the established detail component patterns.
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}