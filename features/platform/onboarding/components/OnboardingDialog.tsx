'use client';

import React, { useState } from 'react';
import { GraphQLClient, gql } from 'graphql-request';
import seedData from '@/features/platform/onboarding/lib/seed.json';
import {
  startOnboarding,
  completeOnboarding,
} from '@/features/platform/onboarding/actions/onboarding';
import {
  AlertCircle,
  AppWindowIcon as Apps,
  Loader2,
  Package,
  Building2,
  Info,
  CircleCheck,
  ArrowUpRight,
  Eye,
  InfoIcon,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RiLoader4Line } from '@remixicon/react';
import { Badge } from '@/components/ui/badge-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FullJsonEditor } from './FullJsonEditor';

const GRAPHQL_ENDPOINT = '/api/graphql';

// Custom template data for JSON editing
interface CustomTemplateData {
  regions: any[];
  paymentProviders: any[];
  shipping: any[];
  categories: any[];
  products: any[];
}

// Templates as in old config - ORIGINAL WORKING CONFIGURATION
const STORE_TEMPLATES = {
  full: {
    name: 'Complete Setup',
    description:
      'Start with a fully configured store including multiple regions, payment methods, and a rich product catalog.',
    icon: <Building2 className="h-5 w-5" />,
    regions: ['na', 'eu', 'uk'],
    paymentProviders: [
      'pp_stripe_stripe',
      'pp_paypal_paypal',
      'pp_system_default',
    ],
    shipping: ['Standard Shipping', 'Express Shipping', 'Return Shipping'],
    categories: ['shirts', 'hoodies', 'accessories', 'pants'],
    collections: ['latest-picks', 'new-arrivals', 'trending'],
    products: [
      'penrose-triangle-tshirt',
      'eschers-staircase-hoodie',
      'mobius-strip-scarf',
      'fibonacci-spiral-crop-top',
      'quantum-entanglement-socks',
      'schrodingers-cat-tank-top',
      'klein-bottle-beanie',
      'paradox-puzzle-sweater',
      'heisenberg-uncertainty-joggers',
      'mandelbrot-set-infinity-shawl',
    ],
    // Display names for UI
    displayNames: {
      regions: ['North America (USD)', 'Europe (EUR)', 'United Kingdom (GBP)'],
      paymentProviders: ['Stripe', 'PayPal', 'Manual Payment'],
      shipping: ['Standard Shipping', 'Express Shipping', 'Return Shipping'],
      categories: ['Shirts', 'Hoodies', 'Accessories', 'Pants'],
      collections: ['Latest Picks', 'New Arrivals', 'Trending'],
      products: [
        'Penrose Triangle T-Shirt',
        "Escher's Staircase Hoodie",
        'Möbius Strip Scarf',
        'Fibonacci Spiral Crop Top',
        'Quantum Entanglement Socks',
        "Schrödinger's Cat Tank Top",
        'Klein Bottle Beanie',
        'Paradox Puzzle Sweater',
        "Heisenberg's Uncertainty Principle Joggers",
        'Mandelbrot Set Infinity Shawl',
      ],
    },
  },
  minimal: {
    name: 'Basic Setup',
    description:
      'Start with just the essentials - one region, one payment method, and basic products.',
    icon: <Package className="h-5 w-5" />,
    regions: ['na'],
    paymentProviders: ['pp_system_default'],
    shipping: ['Standard Shipping'],
    categories: ['shirts'],
    collections: ['latest-picks'],
    products: ['penrose-triangle-tshirt'],
    // Display names for UI
    displayNames: {
      regions: ['North America (USD)'],
      paymentProviders: ['Manual Payment'],
      shipping: ['Standard Shipping'],
      categories: ['Shirts'],
      collections: ['Latest Picks'],
      products: ['Penrose Triangle T-Shirt'],
    },
  },
  custom: {
    name: 'Custom Setup',
    description:
      'Customize your setup with your own JSON templates for each section.',
    icon: <CircleCheck className="h-5 w-5" />,
    regions: ['na'],
    paymentProviders: ['pp_system_default'],
    shipping: ['Standard Shipping'],
    categories: ['shirts'],
    collections: ['latest-picks'],
    products: ['penrose-triangle-tshirt'],
    // Display names for UI (same as minimal by default)
    displayNames: {
      regions: ['North America (USD)'],
      paymentProviders: ['Manual Payment'],
      shipping: ['Standard Shipping'],
      categories: ['Shirts'],
      collections: ['Latest Picks'],
      products: ['Penrose Triangle T-Shirt'],
    },
  },
};

// Section definitions for the progress view
const SECTION_DEFINITIONS = [
  {
    id: 1,
    type: 'regions',
    label: 'Regions & Countries',
    getItemsFn: (template: 'full' | 'minimal' | 'custom') =>
      STORE_TEMPLATES[template].displayNames.regions,
    jsonKey: 'regions' as const,
  },
  {
    id: 2,
    type: 'paymentProviders',
    label: 'Payment Providers',
    getItemsFn: (template: 'full' | 'minimal' | 'custom') =>
      STORE_TEMPLATES[template].displayNames.paymentProviders,
    jsonKey: 'paymentProviders' as const,
  },
  {
    id: 3,
    type: 'shipping',
    label: 'Shipping Options',
    getItemsFn: (template: 'full' | 'minimal' | 'custom') =>
      STORE_TEMPLATES[template].displayNames.shipping,
    jsonKey: 'shipping_options' as const,
  },
  {
    id: 4,
    type: 'categories',
    label: 'Product Categories',
    getItemsFn: (template: 'full' | 'minimal' | 'custom') =>
      STORE_TEMPLATES[template].displayNames.categories,
    jsonKey: 'categories' as const,
  },
  {
    id: 5,
    type: 'collections',
    label: 'Collections',
    getItemsFn: (template: 'full' | 'minimal' | 'custom') =>
      STORE_TEMPLATES[template].displayNames.collections,
    jsonKey: 'collections' as const,
  },
  {
    id: 6,
    type: 'products',
    label: 'Products',
    getItemsFn: (template: 'full' | 'minimal' | 'custom') =>
      STORE_TEMPLATES[template].displayNames.products,
    jsonKey: 'products' as const,
  },
];

// Helper function to extract display items from JSON data
function getItemsFromJsonData(jsonData: any, sectionType: string): string[] {
  if (!jsonData) return [];
  
  switch (sectionType) {
    case 'regions':
      return (jsonData.regions || []).map((r: any) => 
        `${r.name || 'Unknown'} (${(r.currencyCode || 'USD').toUpperCase()})`
      );
    case 'paymentProviders':
      return (jsonData.paymentProviders || []).map((p: any) => p.name || 'Unknown Provider');
    case 'shipping':
      return (jsonData.shipping_options || []).map((s: any) => s.name || 'Unknown Shipping');
    case 'categories':
      return (jsonData.categories || []).map((c: any) => c.title || c.name || 'Unknown Category');
    case 'collections':
      return (jsonData.collections || []).map((c: any) => c.title || c.name || 'Unknown Collection');
    case 'products':
      return (jsonData.products || []).map((p: any) => p.title || 'Unknown Product');
    default:
      return [];
  }
}

// Helper to get the right slice of seed data for a template, and always use the correct entities for minimal/full/custom
function getSeedForTemplate(template: 'full' | 'minimal' | 'custom', seedData: any, customData?: Record<string, string[]>) {
  const templateToUse = template === 'custom' ? 'minimal' : template;
  const tpl = STORE_TEMPLATES[templateToUse];
  
  // Get the region codes for this template
  const templateRegionCodes = tpl.regions;
  
  // Filter products and clean up variant prices to only include relevant regions
  const filteredProducts = (seedData.products as any[])
    .filter((p: any) => tpl.products.includes(p.handle))
    .map((product: any) => ({
      ...product,
      variants: product.variants.map((variant: any) => ({
        ...variant,
        prices: variant.prices.filter((price: any) => 
          templateRegionCodes.includes(price.regionCode)
        )
      }))
    }));
  
  return {
    regions: (seedData.regions as any[]).filter((r: any) =>
      tpl.regions.includes(r.code)
    ),
    paymentProviders: (seedData.paymentProviders as any[]).filter((p: any) =>
      tpl.paymentProviders.includes(p.code)
    ),
    shipping_options: (seedData.shipping_options as any[]).filter((s: any) =>
      tpl.shipping.includes(s.name)
    ),
    categories: (seedData.categories as any[]).filter((c: any) =>
      tpl.categories.includes(c.handle)
    ),
    collections: (seedData.collections as any[]).filter((c: any) =>
      tpl.collections.includes(c.handle)
    ),
    products: filteredProducts,
  };
}

// Define a unified SectionItem component to handle all states
interface SectionItemProps {
  item: string;
  sectionType: string;
  status: 'normal' | 'loading' | 'completed' | 'error';
  errorMessage?: string;
  requiresEnvVar?: {
    vars: string[];
    description?: string;
  };
  step?: 'template' | 'progress' | 'done';
}

const SectionItem: React.FC<SectionItemProps> = ({
  item,
  // sectionType is used for semantic clarity but not directly used in the component
  status,
  errorMessage,
  requiresEnvVar,
  step,
}) => {
  // Determine styling based on status
  const getItemStyles = () => {
    switch (status) {
      case 'completed':
        return 'bg-blue-50 dark:bg-blue-900/10 border-blue-400/20 dark:border-blue-700/50';
      case 'loading':
        return 'bg-background border-blue-500/30 dark:border-blue-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800';
      default:
        return 'border-border';
    }
  };

  // Render the appropriate icon based on status
  const renderStatusIcon = () => {
    switch (status) {
      case 'completed':
        return (
          <CircleCheck className="mr-1.5 h-3.5 w-3.5 fill-blue-500 text-background" />
        );
      case 'loading':
        return (
          <RiLoader4Line className="mr-1.5 h-3.5 w-3.5 animate-spin text-blue-500" />
        );
      case 'error':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <AlertCircle className="mr-1.5 h-3.5 w-3.5 text-red-500" />
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                align="start"
                className="p-4 text-xs min-w-[250px] max-w-[450px] z-[100]"
              >
                <div className="font-medium text-sm mb-2 text-red-600 dark:text-red-400">
                  Failed to create {item}
                </div>
                <div className="text-sm text-left mb-3">
                  This item already exists or conflicts with existing data in
                  your installation.
                </div>
                <div className="font-mono text-xs text-left whitespace-pre-wrap break-words max-h-[150px] overflow-y-auto text-muted-foreground border-t pt-3 mt-1">
                  <span className="font-semibold block mb-1">
                    Error details:
                  </span>
                  {errorMessage || 'Unknown error'}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      default:
        return null;
    }
  };

  // Standard item rendering with ENV var requirements if applicable
  return (
    <div
      className={`inline-flex items-center px-2 py-1 border rounded-md text-xs ${getItemStyles()}`}
    >
      {renderStatusIcon()}
      <span>{item}</span>
      {requiresEnvVar && requiresEnvVar.vars.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info
                className={`ml-2 h-3 w-3 cursor-help ${
                  step === 'done' ? 'text-red-500' : 'text-blue-500'
                }`}
                aria-hidden={true}
              />
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              align="start"
              className="p-3 text-xs max-w-sm z-[100]"
            >
              <p>
                Requires
                {requiresEnvVar.vars.map((envVar, index) => (
                  <React.Fragment key={envVar}>
                    {index > 0 && ' and '}
                    <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">
                      {envVar}
                    </code>
                  </React.Fragment>
                ))}
                in your
                <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">
                  .env
                </code>
                file
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

// Unified section renderer component
interface SectionRendererProps {
  sections: Array<{
    id: number;
    type: string;
    label: string;
    getItemsFn: (template: 'full' | 'minimal' | 'custom') => string[];
    jsonKey?: 'regions' | 'paymentProviders' | 'shipping_options' | 'categories' | 'collections' | 'products';
  }>;
  selectedTemplate: 'full' | 'minimal' | 'custom';
  isLoading: boolean;
  loadingItems: Record<string, string[]>;
  completedItems: Record<string, string[]>;
  itemErrors: Record<string, Record<string, string>>;
  error: string | null;
  step: 'template' | 'progress' | 'done';
  currentJsonData?: any;
}

const SectionRenderer: React.FC<SectionRendererProps> = ({
  sections,
  selectedTemplate,
  isLoading,
  loadingItems,
  completedItems,
  itemErrors,
  error,
  step,
  currentJsonData,
}) => {
  return (
    <div className="space-y-0">
      {sections.map((section, idx) => {
        const isLastItem = idx === sections.length - 1;
        const items = currentJsonData ? getItemsFromJsonData(currentJsonData, section.type) : [];

        return (
          <div key={section.type} className="relative">
            {/* Connecting line between sections */}
            {!isLastItem && (
              <div className="absolute left-3 top-3 bottom-0 w-[1px] bg-border"></div>
            )}

            {/* Section header with number badge */}
            <div className="flex items-center space-x-3 mb-2 relative">
              <div className="inline-flex size-6 items-center justify-center rounded-sm border border-border bg-background text-sm text-foreground shadow-sm z-10">
                {section.id}
              </div>
              <Label className="text-sm font-medium text-foreground">
                {section.label}
              </Label>
            </div>

            {/* Section items */}
            <div className="pl-9">
              <div className="flex flex-wrap gap-2 pb-6">
                {/* Special case for payment providers with tooltips */}
                {section.type === 'paymentProviders' &&
                selectedTemplate === 'full' ? (
                  <>
                    <SectionItem
                      item="Stripe"
                      sectionType={section.type}
                      status={
                        step === 'done'
                          ? 'completed'
                          : error && itemErrors[section.type]?.['Stripe']
                          ? 'error'
                          : completedItems[section.type]?.includes('Stripe')
                          ? 'completed'
                          : 'normal'
                      }
                      errorMessage={itemErrors[section.type]?.['Stripe']}
                      requiresEnvVar={{
                        vars: ['NEXT_PUBLIC_STRIPE_KEY', 'STRIPE_SECRET_KEY'],
                      }}
                      step={step}
                    />
                    <SectionItem
                      item="PayPal"
                      sectionType={section.type}
                      status={
                        step === 'done'
                          ? 'completed'
                          : error && itemErrors[section.type]?.['PayPal']
                          ? 'error'
                          : completedItems[section.type]?.includes('PayPal')
                          ? 'completed'
                          : 'normal'
                      }
                      errorMessage={itemErrors[section.type]?.['PayPal']}
                      requiresEnvVar={{
                        vars: [
                          'NEXT_PUBLIC_PAYPAL_CLIENT_ID',
                          'PAYPAL_CLIENT_SECRET',
                        ],
                      }}
                      step={step}
                    />
                    <SectionItem
                      item="Manual Payment"
                      sectionType={section.type}
                      status={
                        step === 'done'
                          ? 'completed'
                          : error &&
                            itemErrors[section.type]?.['Manual']
                          ? 'error'
                          : completedItems[section.type]?.includes(
                              'Manual'
                            )
                          ? 'completed'
                          : 'normal'
                      }
                      errorMessage={
                        itemErrors[section.type]?.['Manual']
                      }
                      step={step}
                    />
                  </>
                ) : (
                  // Standard items rendering for all other cases
                  items.map((item) => {
                    // Determine the status of this item
                    let status: 'normal' | 'loading' | 'completed' | 'error' =
                      'normal';
                    let errorMessage: string | undefined;

                    // For completed step, all items are completed
                    if (step === 'done') {
                      status = 'completed';
                    } else {
                      // Check for errors first
                      if (error && itemErrors[section.type]?.[item]) {
                        status = 'error';
                        errorMessage = itemErrors[section.type][item];
                      }
                      // Then check if it's completed
                      else if (completedItems[section.type]?.includes(item)) {
                        status = 'completed';
                      }
                      // Then check if it's loading
                      else if (
                        isLoading &&
                        loadingItems[section.type]?.includes(item)
                      ) {
                        status = 'loading';
                      }
                    }

                    return (
                      <SectionItem
                        key={item}
                        item={item}
                        sectionType={section.type}
                        status={status}
                        errorMessage={errorMessage}
                        step={step}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Payment provider environment variable mapping
const PAYMENT_PROVIDER_ENV_VARS: Record<string, string[]> = {
  Stripe: ['NEXT_PUBLIC_STRIPE_KEY', 'STRIPE_SECRET_KEY'],
  PayPal: ['NEXT_PUBLIC_PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET'],
};

// Component to display payment provider environment variables
interface PaymentProviderEnvDisplayProps {
  createdProviders: string[];
}

const PaymentProviderEnvDisplay: React.FC<PaymentProviderEnvDisplayProps> = ({
  createdProviders,
}) => {
  const [activeTab, setActiveTab] = useState(createdProviders[0] || '');

  // Filter out Manual Payment as it doesn't need env vars
  const providersWithEnvVars = createdProviders.filter(
    (provider) =>
      provider !== 'Manual Payment' && PAYMENT_PROVIDER_ENV_VARS[provider]
  );

  if (providersWithEnvVars.length === 0) {
    return null;
  }

  const renderEnvVars = (provider: string) => {
    const envVars = PAYMENT_PROVIDER_ENV_VARS[provider];
    if (!envVars) return null;

    return (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground mb-3">
          For {provider} to work, you need to add these environment variables to your .env file:
        </p>
        {envVars.map((envVar: string) => (
          <div key={envVar} className="flex items-center gap-2">
            <code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-xs font-mono">
              {envVar}
            </code>
          </div>
        ))}
      
      </div>
    );
  };

  if (providersWithEnvVars.length === 1) {
    // Single provider - show tooltip directly
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Eye className="ml-2 h-3 w-3 cursor-help text-red-500" />
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            align="start"
            className="p-3 text-xs max-w-sm z-[100]"
          >
            {renderEnvVars(providersWithEnvVars[0])}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Multiple providers - show tabs in tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <InfoIcon className="ml-2 h-3 w-3 cursor-help text-red-500" />
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="start"
          className="p-0 text-xs max-w-sm z-[100]"
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full m-1"
          >
            {/* <TabsList className="grid w-full grid-cols-2 h-8 p-1 m-2 mb-0">
              {providersWithEnvVars.map((provider) => (
                <TabsTrigger 
                  key={provider} 
                  value={provider}
                  className="text-xs h-6 px-2"
                >
                  {provider}
                </TabsTrigger>
              ))}
            </TabsList> */}
            <TabsList className="bg-muted/40 border py-2">
              {providersWithEnvVars.map((provider) => (
                <TabsTrigger
                  key={provider}
                  value={provider}
                  className="border border-transparent data-[state=active]:border-border data-[state=active]:shadow-none"
                >
                  <code className="text-xs uppercase tracking-wide">
                    {provider}
                  </code>
                </TabsTrigger>
              ))}
            </TabsList>
            {providersWithEnvVars.map((provider) => (
              <TabsContent key={provider} value={provider} className="px-1 py-2 mt-0">
                {renderEnvVars(provider)}
              </TabsContent>
            ))}
          </Tabs>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface OnboardingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingDialog: React.FC<OnboardingDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState<'template' | 'progress' | 'done'>(
    'template'
  );
  const [selectedTemplate, setSelectedTemplate] = useState<'full' | 'minimal' | 'custom'>(
    'minimal'
  );
  const [currentJsonData, setCurrentJsonData] = useState<any>(null);
  const [customJsonApplied, setCustomJsonApplied] = useState(false);
  
  // Load JSON data when template changes
  React.useEffect(() => {
    if (selectedTemplate !== 'custom') {
      const templateData = getSeedForTemplate(selectedTemplate, seedData);
      setCurrentJsonData(templateData);
      setCustomJsonApplied(false);
    } else {
      // For custom, start with basic template
      const basicData = getSeedForTemplate('minimal', seedData);
      setCurrentJsonData(basicData);
      setCustomJsonApplied(false);
    }
  }, [selectedTemplate]);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [loadingItems, setLoadingItems] = useState<Record<string, string[]>>({
    regions: [],
    paymentProviders: [],
    shipping: [],
    categories: [],
    collections: [],
    products: [],
  });
  const [completedItems, setCompletedItems] = useState<
    Record<string, string[]>
  >({
    regions: [],
    paymentProviders: [],
    shipping: [],
    categories: [],
    collections: [],
    products: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [itemErrors, setItemErrors] = useState<
    Record<string, Record<string, string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to get display names from current data
  const getDisplayNamesFromData = (data: any) => {
    return {
      regions: getItemsFromJsonData(data, 'regions'),
      paymentProviders: getItemsFromJsonData(data, 'paymentProviders'),
      shipping: getItemsFromJsonData(data, 'shipping'),
      categories: getItemsFromJsonData(data, 'categories'),
      products: getItemsFromJsonData(data, 'products'),
      collections: getItemsFromJsonData(data, 'collections'),
    };
  };

  // Helper function to update UI based on progress
  const setProgress = (message: string) => {
    setProgressMessage(message);

    // Get the current display names (either from template or from actual data)
    const displayNames = currentJsonData 
      ? getDisplayNamesFromData(currentJsonData)
      : STORE_TEMPLATES[selectedTemplate].displayNames;

    // Process based on current step
    if (
      message.includes('currencies') ||
      message.includes('countries') ||
      message.includes('regions')
    ) {
      // Mark previous steps as completed
      // No previous steps for regions
    } else if (message.includes('payment provider')) {
      // When working on payment providers, regions are completed
      setCompletedItems((prev) => ({
        ...prev,
        regions: [...displayNames.regions],
      }));

      // Clear loading state for regions
      setLoadingItems((prev) => ({
        ...prev,
        regions: [],
      }));
    } else if (message.includes('shipping')) {
      // When working on shipping, regions and payment providers are completed
      setCompletedItems((prev) => ({
        ...prev,
        regions: [...displayNames.regions],
        paymentProviders: [...displayNames.paymentProviders],
      }));

      // Clear loading state for payment providers
      setLoadingItems((prev) => ({
        ...prev,
        paymentProviders: [],
      }));
    } else if (message.includes('categories')) {
      // When working on categories, all previous steps are completed
      setCompletedItems((prev) => ({
        ...prev,
        regions: [...displayNames.regions],
        paymentProviders: [...displayNames.paymentProviders],
        shipping: [...displayNames.shipping],
      }));

      // Clear loading state for shipping
      setLoadingItems((prev) => ({
        ...prev,
        shipping: [],
      }));
    } else if (message.includes('collections')) {
      // When working on collections, all previous steps are completed
      setCompletedItems((prev) => ({
        ...prev,
        regions: [...displayNames.regions],
        paymentProviders: [...displayNames.paymentProviders],
        shipping: [...displayNames.shipping],
        categories: [...displayNames.categories],
      }));

      // Clear loading state for categories
      setLoadingItems((prev) => ({
        ...prev,
        categories: [],
      }));
    } else if (message.includes('products')) {
      // When working on products, all previous steps are completed
      setCompletedItems((prev) => ({
        ...prev,
        regions: [...displayNames.regions],
        paymentProviders: [...displayNames.paymentProviders],
        shipping: [...displayNames.shipping],
        categories: [...displayNames.categories],
        collections: [...displayNames.collections || []],
      }));

      // Clear loading state for collections
      setLoadingItems((prev) => ({
        ...prev,
        collections: [],
      }));
    } else if (message.includes('complete')) {
      // On completion, no loading items and all items are completed
      setLoadingItems((prev) => ({
        ...prev,
        products: [], // Clear loading state for products
      }));

      setCompletedItems({
        regions: [...displayNames.regions],
        paymentProviders: [...displayNames.paymentProviders],
        shipping: [...displayNames.shipping],
        categories: [...displayNames.categories],
        collections: [...displayNames.collections || []],
        products: [...displayNames.products],
      });
    }
  };

  // Helper functions to update individual item states
  const setItemLoading = (type: string, item: string) => {
    setLoadingItems((prev) => ({
      ...prev,
      [type]: [...prev[type], item],
    }));

    // Clear any previous error for this item
    setItemErrors((prev) => {
      const newErrors = { ...prev };
      if (newErrors[type] && newErrors[type][item]) {
        const newTypeErrors = { ...newErrors[type] };
        delete newTypeErrors[item];
        newErrors[type] = newTypeErrors;
      }
      return newErrors;
    });
  };

  const setItemCompleted = (type: string, item: string) => {
    // Remove from loading items
    setLoadingItems((prev) => ({
      ...prev,
      [type]: prev[type].filter((i) => i !== item),
    }));

    // Add to completed items
    setCompletedItems((prev) => ({
      ...prev,
      [type]: [...prev[type], item],
    }));

    // Clear any error for this item
    setItemErrors((prev) => {
      const newErrors = { ...prev };
      if (newErrors[type] && newErrors[type][item]) {
        const newTypeErrors = { ...newErrors[type] };
        delete newTypeErrors[item];
        newErrors[type] = newTypeErrors;
      }
      return newErrors;
    });
  };

  // Helper to set an error for a specific item
  const setItemError = (type: string, item: string, errorMessage: string) => {
    // Remove from loading items
    setLoadingItems((prev) => ({
      ...prev,
      [type]: prev[type].filter((i) => i !== item),
    }));

    // Set the error for this item
    setItemErrors((prev) => {
      const newErrors = { ...prev };
      if (!newErrors[type]) {
        newErrors[type] = {};
      }
      newErrors[type][item] = errorMessage;
      return newErrors;
    });
  };

  async function runOnboarding() {
    setIsLoading(true);
    setError(null);
    setItemErrors({});

    // Reset state
    setLoadingItems({
      regions: [],
      paymentProviders: [],
      shipping: [],
      categories: [],
      collections: [],
      products: [],
    });

    setCompletedItems({
      regions: [],
      paymentProviders: [],
      shipping: [],
      categories: [],
      collections: [],
      products: [],
    });

    setStep('progress');
    setProgress('Starting onboarding...');

    // Mark onboarding as started
    try {
      await startOnboarding();
    } catch (error) {
      console.error('Error marking onboarding as started:', error);
    }

    try {
      const data = currentJsonData || getSeedForTemplate(selectedTemplate, seedData);
      const client = new GraphQLClient(GRAPHQL_ENDPOINT, {
        headers: { 'Content-Type': 'application/json' },
      });

      // 0. Create the store first
      setProgress('Creating store...');
      let createdStoreId = '';
      try {
        const storeMutation = gql`
          mutation CreateStore($data: StoreCreateInput!) {
            createStore(data: $data) {
              id
              name
            }
          }
        `;
        const storeResult = (await client.request(storeMutation, {
          data: {
            name: 'Impossible Tees',
            defaultCurrencyCode: 'usd',
            homepageTitle: 'Modern Apparel Store',
            homepageDescription: 'Quality clothing and unique designs.',
          },
        })) as { createStore: { id: string } };
        createdStoreId = storeResult.createStore.id;
      } catch (error: any) {
        console.error('Error creating store:', error);
        // Continue with onboarding even if store creation fails
      }

      // 1. Create currencies
      setProgress('Creating currencies...');
      const createdCurrencies: Record<string, string> = {};
      for (const region of data.regions) {
        // Set the specific region as loading
        const regionName = `${region.name || 'Unknown'} (${(region.currencyCode || 'USD').toUpperCase()})`;
        setItemLoading('regions', regionName);

        try {
          const mutation = gql`
            mutation CreateCurrency($data: CurrencyCreateInput!) {
              createCurrency(data: $data) {
                id
                code
              }
            }
          `;
          const result = (await client.request(mutation, {
            data: {
              code: region.currencyCode,
              symbol: region.currencySymbol,
              symbolNative: region.currencySymbol,
              name: region.currencyName,
              stores: createdStoreId ? { connect: [{ id: createdStoreId }] } : undefined,
            },
          })) as { createCurrency: { id: string } };
          createdCurrencies[region.currencyCode] = result.createCurrency.id;

          // Mark the region as completed after its currency is created
          setItemCompleted('regions', regionName);
        } catch (itemError: any) {
          // Format the error message
          let itemErrorMessage = itemError.message || 'Unknown error';
          if (itemError.response?.errors) {
            itemErrorMessage = itemError.response.errors
              .map((err: any) => err.message || JSON.stringify(err))
              .join('\n');
          }

          // Set specific error for this item
          setItemError('regions', regionName, itemErrorMessage);

          // Continue with other items
          console.error(
            `Error creating currency for ${region.name}:`,
            itemError
          );
        }
      }

      // 2. Create countries and store by iso2
      setProgress('Creating countries...');
      const createdCountries: Record<string, string> = {};
      for (const region of data.regions) {
        for (const country of region.countries) {
          const mutation = gql`
            mutation CreateCountry($data: CountryCreateInput!) {
              createCountry(data: $data) {
                id
                iso2
              }
            }
          `;
          const result = (await client.request(mutation, {
            data: country,
          })) as { createCountry: { id: string } };
          createdCountries[country.iso2] = result.createCountry.id;
        }
      }

      // 3. Create payment providers (before regions!) and store by code
      setProgress('Creating payment providers...');
      const createdPaymentProviders: Record<string, string> = {};
      for (const provider of data.paymentProviders) {
        // Set the specific payment provider as loading
        const providerName = provider.name || 'Unknown Provider';
        setItemLoading('paymentProviders', providerName);

        const mutation = gql`
          mutation CreatePaymentProvider($data: PaymentProviderCreateInput!) {
            createPaymentProvider(data: $data) {
              id
              code
            }
          }
        `;
        const result = (await client.request(mutation, { data: provider })) as {
          createPaymentProvider: { id: string };
        };
        createdPaymentProviders[provider.code] =
          result.createPaymentProvider.id;

        // Mark the payment provider as completed
        setItemCompleted('paymentProviders', providerName);
      }

      // 4. Create fulfillment provider (always manual) and store by code
      setProgress('Creating fulfillment provider...');
      const createdFulfillmentProviders: Record<string, string> = {};
      const fulfillmentMutation = gql`
        mutation CreateFulfillmentProvider(
          $data: FulfillmentProviderCreateInput!
        ) {
          createFulfillmentProvider(data: $data) {
            id
            code
          }
        }
      `;
      const fulfillmentResult = (await client.request(fulfillmentMutation, {
        data: {
          code: 'fp_manual',
          name: 'Manual Fulfillment',
          isInstalled: true,
        },
      })) as { createFulfillmentProvider: { id: string } };
      createdFulfillmentProviders['fp_manual'] =
        fulfillmentResult.createFulfillmentProvider.id;

      // 5. Create regions (connect only to created payment providers)
      setProgress('Creating regions...');
      const createdRegions: Record<string, string> = {};
      for (const region of data.regions) {
        const filteredPaymentProviders = (
          region.paymentProviders?.connect || []
        )
          .map((p: any) => createdPaymentProviders[p.code])
          .filter(Boolean)
          .map((id: string) => ({ id }));
        const filteredFulfillmentProviders =
          region.fulfillmentProviders?.connect || []
            ? region.fulfillmentProviders.connect
                .map((p: any) => createdFulfillmentProviders[p.code])
                .filter(Boolean)
                .map((id: string) => ({ id }))
            : [];
        const mutation = gql`
          mutation CreateRegion($data: RegionCreateInput!) {
            createRegion(data: $data) {
              id
              code
            }
          }
        `;
        const result = (await client.request(mutation, {
          data: {
            code: region.code,
            name: region.name,
            currency: {
              connect: { id: createdCurrencies[region.currencyCode] },
            },
            taxRate: region.taxRate,
            paymentProviders:
              filteredPaymentProviders.length > 0
                ? { connect: filteredPaymentProviders }
                : undefined,
            fulfillmentProviders:
              filteredFulfillmentProviders.length > 0
                ? { connect: filteredFulfillmentProviders }
                : undefined,
            countries: {
              connect: region.countries.map((c: { iso2: string }) => ({
                id: createdCountries[c.iso2],
              })),
            },
          },
        })) as { createRegion: { id: string } };
        createdRegions[region.code] = result.createRegion.id;
      }

      // 6. Create shipping options
      setProgress('Creating shipping options...');
      for (const option of data.shipping_options) {
        // Set the specific shipping option as loading
        const shippingName = option.name || 'Unknown Shipping';
        setItemLoading('shipping', shippingName);

        for (const region of data.regions) {
          const mutation = gql`
            mutation CreateShippingOption($data: ShippingOptionCreateInput!) {
              createShippingOption(data: $data) {
                id
              }
            }
          `;
          await client.request(mutation, {
            data: {
              name: option.name,
              priceType: option.priceType,
              amount: option.amount,
              isReturn: option.isReturn || false,
              uniqueKey: `${option.name}-${region.code}`,
              fulfillmentProvider: {
                connect: { id: createdFulfillmentProviders['fp_manual'] },
              },
              region: { connect: { id: createdRegions[region.code] } },
            },
          });
        }

        // Mark the shipping option as completed
        setItemCompleted('shipping', shippingName);
      }

      // 7. Create categories
      setProgress('Creating categories...');
      // Map: handle -> id for created categories
      const createdCategories: Record<string, string> = {};
      for (const category of data.categories) {
        // Set the specific category as loading
        const categoryName = category.title || category.name || 'Unknown Category';
        setItemLoading('categories', categoryName);

        const mutation = gql`
          mutation CreateProductCategory($data: ProductCategoryCreateInput!) {
            createProductCategory(data: $data) {
              id
              handle
            }
          }
        `;
        const result = (await client.request(mutation, {
          data: {
            title: category.name, // map to title
            handle: category.handle,
            isActive: category.isActive,
          },
        })) as { createProductCategory: { id: string } };
        createdCategories[category.handle] = result.createProductCategory.id;

        // Mark the category as completed
        setItemCompleted('categories', categoryName);
      }

      // 8. Create collections
      setProgress('Creating collections...');
      // Map: handle -> id for created collections
      const createdCollections: Record<string, string> = {};
      for (const collection of data.collections) {
        // Set the specific collection as loading
        const collectionName = collection.title || 'Unknown Collection';
        setItemLoading('collections', collectionName);

        const mutation = gql`
          mutation CreateProductCollection(
            $data: ProductCollectionCreateInput!
          ) {
            createProductCollection(data: $data) {
              id
              handle
            }
          }
        `;
        const result = (await client.request(mutation, {
          data: collection,
        })) as { createProductCollection: { id: string } };
        createdCollections[collection.handle] =
          result.createProductCollection.id;

        // Mark the collection as completed
        setItemCompleted('collections', collectionName);
      }

      // 9. Create products and variants
      setProgress('Creating products and variants...');
      for (const product of data.products) {
        // Set the specific product as loading
        const productName = product.title || 'Unknown Product';
        setItemLoading('products', productName);

        const {
          variants,
          productCollections,
          productCategories,
          subtitle,
          ...productInput
        } = product;
        // Only connect the collections that exist for this product, by id
        let collectionsToConnect: any[] = [];
        if (productCollections && productCollections.connect) {
          collectionsToConnect = productCollections.connect
            .map((c: { handle: string }) => createdCollections[c.handle])
            .filter(Boolean)
            .map((id: string) => ({ id }));
        }
        // Only connect the categories that exist for this product, by id
        let categoriesToConnect: any[] = [];
        if (productCategories && productCategories.connect) {
          categoriesToConnect = productCategories.connect
            .map((c: { handle: string }) => createdCategories[c.handle])
            .filter(Boolean)
            .map((id: string) => ({ id }));
        }
        // Remove variants and connect collections/categories by id, omit subtitle if null/empty
        const productData = {
          ...productInput,
          ...(typeof subtitle === 'string' && subtitle.trim() !== ''
            ? { subtitle }
            : {}),
          productCollections:
            collectionsToConnect.length > 0
              ? { connect: collectionsToConnect }
              : undefined,
          productCategories:
            categoriesToConnect.length > 0
              ? { connect: categoriesToConnect }
              : undefined,
          productImages: {
            create: [
              {
                imagePath: `/images/${productInput.handle}.jpeg`,
                altText: productInput.title,
              },
            ],
          },
        };
        // Create product
        const productMutation = gql`
          mutation CreateProduct($data: ProductCreateInput!) {
            createProduct(data: $data) {
              id
              productOptions {
                id
                title
                productOptionValues {
                  id
                  value
                }
              }
            }
          }
        `;
        const productResult = await client.request(productMutation, {
          data: productData,
        });
        // Create variants for this product
        for (const variant of variants) {
          const variantMutation = gql`
            mutation CreateProductVariant($data: ProductVariantCreateInput!) {
              createProductVariant(data: $data) {
                id
                title
              }
            }
          `;
          const allOptionValues = (
            productResult as any
          ).createProduct.productOptions.flatMap(
            (opt: any) => opt.productOptionValues
          );
          const matchingIds = variant.options
            .map(
              (opt: any) =>
                allOptionValues.find((v: any) => v.value === opt.value)?.id
            )
            .filter(Boolean)
            .map((id: string) => ({ id }));
          // Only create prices where both currency and region exist (old code pattern)
          const validPrices = variant.prices.filter(
            (price: { currencyCode: string; regionCode: string }) =>
              createdCurrencies[price.currencyCode] &&
              createdRegions[price.regionCode]
          );
          const prices = {
            create: validPrices.map(
              (price: {
                currencyCode: string;
                regionCode: string;
                amount: number;
              }) => ({
                amount: price.amount,
                currency: {
                  connect: { id: createdCurrencies[price.currencyCode] },
                },
                region: { connect: { id: createdRegions[price.regionCode] } },
              })
            ),
          };
          await client.request(variantMutation, {
            data: {
              title: variant.title,
              inventoryQuantity: variant.inventoryQuantity,
              manageInventory: variant.manageInventory,
              product: {
                connect: { id: (productResult as any).createProduct.id },
              },
              productOptionValues: { connect: matchingIds },
              prices,
            },
          });
        }

        // Mark the product as completed
        setItemCompleted('products', productName);
      }

      setProgress('Onboarding complete!');

      // Mark onboarding as completed
      try {
        await completeOnboarding();
      } catch (error) {
        console.error('Error marking onboarding as completed:', error);
      }

      setStep('done');
    } catch (e: any) {
      // Keep the loading state active so we can see what was completed
      // but show the error message

      // Format the error message for better readability
      let errorMessage = e.message || 'Unknown error';

      // Check if it's a GraphQL error with response data
      if (e.response?.errors) {
        // Format GraphQL errors in a more readable way
        errorMessage = e.response.errors
          .map((err: any) => {
            // Check for Prisma errors which have a specific structure
            if (err.message && err.message.includes('Prisma error')) {
              try {
                // For Prisma errors, simplify the message to just show the constraint failure
                if (err.message.includes('Unique constraint failed')) {
                  return 'Unique constraint failed - this item already exists.';
                }

                // Try to extract and format the Prisma error details
                const match = err.message.match(/\{[\s\S]*\}/);
                if (match) {
                  const errorObj = JSON.parse(match[0]);
                  // Return a simplified error message
                  return `Prisma error: ${
                    errorObj.message || 'Unknown Prisma error'
                  }`;
                }
              } catch (parseError) {
                // If parsing fails, just return the original message
              }
            }

            // Extract the most useful parts of the error
            if (err.message) {
              // Clean up the message by removing JSON-like structures
              return err.message.replace(/\{[\s\S]*\}/g, '[Error details omitted]');
            }

            // Last resort - stringify but limit length
            const stringified = JSON.stringify(err, null, 2);
            return stringified.length > 500
              ? stringified.substring(0, 500) + '...'
              : stringified;
          })
          .join('\n\n');
      }

      setError(errorMessage);
      console.error('Error during onboarding:', e);

      // For demonstration purposes, let's mark only the first non-completed item as failed
      // In a real implementation, you would determine which specific items failed
      const newItemErrors: Record<string, Record<string, string>> = {};

      // Find the first section with non-completed items
      for (const section of SECTION_DEFINITIONS) {
        const sectionType = section.type;
        const sectionItems = section.getItemsFn(selectedTemplate);
        const completedSectionItems = completedItems[sectionType] || [];

        // Find the first non-completed item
        const failedItem = sectionItems.find(
          (item) => !completedSectionItems.includes(item)
        );

        if (failedItem) {
          // Mark only this item as failed
          newItemErrors[sectionType] = {
            [failedItem]: errorMessage,
          };

          // Only mark one item as failed for demonstration
          break;
        }
      }

      setItemErrors(newItemErrors);

      // Some items may have failed, but we'll still show the completed ones
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-3xl gap-0 max-w-[95vw]">
        <DialogHeader className="border-b px-6 py-4 mb-0">
          <DialogTitle>Onboarding</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col-reverse md:flex-row">
          <div className="flex flex-col justify-between md:w-80 md:border-r">
            <div className="flex-1 grow">
              <div className="border-t p-6 md:border-none">
                <div className="flex items-center space-x-3">
                  <div className="inline-flex shrink-0 items-center justify-center rounded-sm bg-muted p-3">
                    <Apps
                      className="size-5 text-foreground"
                      aria-hidden={true}
                    />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-medium text-foreground">
                      Store Setup
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {step === 'done'
                        ? 'Your store is ready'
                        : selectedTemplate === 'custom'
                        ? 'Copy JSON templates for custom setup'
                        : 'Configure your new store'}
                    </p>
                  </div>
                </div>
                <Separator className="my-4" />

                {step === 'done' ? (
                  <>
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      Setup Complete
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your
                      {selectedTemplate === 'minimal' ? 'Basic' : 'Complete'}
                      store setup is ready to use.
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-emerald-600 dark:text-emerald-500 mb-4">
                      <CircleCheck className="h-4 w-4 fill-emerald-500 text-background" />
                      <span>Onboarding complete</span>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <CircleCheck className="h-4 w-4 fill-muted-foreground text-background" />
                        <span className="font-medium">
                          {selectedTemplate === 'minimal' ? '1' : '3'} region
                          {selectedTemplate === 'minimal' ? '' : 's'} created
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <CircleCheck className="h-4 w-4 fill-muted-foreground text-background" />
                        <span className="font-medium">
                          {selectedTemplate === 'minimal' ? '1' : '3'} payment
                          method{selectedTemplate === 'minimal' ? '' : 's '}
                          created
                        </span>
                        <PaymentProviderEnvDisplay
                          createdProviders={
                            STORE_TEMPLATES[selectedTemplate].displayNames
                              .paymentProviders
                          }
                        />
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <CircleCheck className="h-4 w-4 fill-muted-foreground text-background" />
                        <span className="font-medium">
                          {selectedTemplate === 'minimal' ? '1' : '3'} shipping
                          option{selectedTemplate === 'minimal' ? '' : 's '}
                          created
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <CircleCheck className="h-4 w-4 fill-muted-foreground text-background" />
                        <span className="font-medium">
                          {selectedTemplate === 'minimal' ? '1' : '4'} categor
                          {selectedTemplate === 'minimal' ? 'y' : 'ies'} created
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <CircleCheck className="h-4 w-4 fill-muted-foreground text-background" />
                        <span className="font-medium">
                          {selectedTemplate === 'minimal' ? '1' : '6'} product
                          {selectedTemplate === 'minimal' ? '' : 's'} created
                        </span>
                      </div>
                    </div>
                  </>
                ) : !isLoading ? (
                  <>
                    <h4 className="text-sm font-medium text-foreground mb-4">
                      Setup Type
                    </h4>
                    <RadioGroup
                      value={selectedTemplate}
                      onValueChange={(value) =>
                        setSelectedTemplate(value as 'minimal' | 'full' | 'custom')
                      }
                      className="space-y-4"
                    >
                      <div
                        className={`border p-4 rounded-md transition-colors cursor-pointer ${
                          selectedTemplate === 'minimal'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'hover:border-blue-200'
                        }`}
                        onClick={() => setSelectedTemplate('minimal')}
                      >
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 mt-[3px]">
                            <Package
                              className={`h-5 w-5 ${
                                selectedTemplate === 'minimal'
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <RadioGroupItem
                              value="minimal"
                              id="minimal"
                              className="sr-only"
                            />
                            <Label
                              htmlFor="minimal"
                              className="flex-1 cursor-pointer"
                            >
                              <div className="font-medium text-base mb-1">
                                Basic Setup
                              </div>
                              <div className="text-sm text-muted-foreground">
                                One region, one payment method, minimal products
                              </div>
                            </Label>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`border p-4 rounded-md transition-colors cursor-pointer ${
                          selectedTemplate === 'full'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'hover:border-blue-200'
                        }`}
                        onClick={() => setSelectedTemplate('full')}
                      >
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 mt-[3px]">
                            <Building2
                              className={`h-5 w-5 ${
                                selectedTemplate === 'full'
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <RadioGroupItem
                              value="full"
                              id="full"
                              className="sr-only"
                            />
                            <Label
                              htmlFor="full"
                              className="flex-1 cursor-pointer"
                            >
                              <div className="font-medium text-base mb-1">
                                Complete Setup
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Multiple regions, payment methods, and products
                              </div>
                            </Label>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`border p-4 rounded-md transition-colors cursor-pointer ${
                          selectedTemplate === 'custom'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'hover:border-blue-200'
                        }`}
                        onClick={() => setSelectedTemplate('custom')}
                      >
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 mt-[3px]">
                            <CircleCheck
                              className={`h-5 w-5 ${
                                selectedTemplate === 'custom'
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <RadioGroupItem
                              value="custom"
                              id="custom"
                              className="sr-only"
                            />
                            <Label
                              htmlFor="custom"
                              className="flex-1 cursor-pointer"
                            >
                              <div className="font-medium text-base mb-1">
                                Custom Setup
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Copy JSON templates to create your own setup
                              </div>
                            </Label>
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                  </>
                ) : (
                  <>
                    <h4 className="text-sm font-medium text-foreground">
                      Creating
                      {selectedTemplate === 'minimal' ? 'Basic' : 'Complete'}
                      Setup
                    </h4>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {progressMessage}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col border-t">
              {/* Error message above buttons */}
              {error && !isLoading && step !== 'done' && (
                // <div className="px-4 py-2 text-sm text-red-600 dark:text-red-500 border-b">
                //   <div className="flex gap-3">
                //     <AlertCircle className="size-7" />
                //     <span>Error: Please ensure you're using a fresh installation without existing data.</span>
                //   </div>
                // </div>
                <Badge
                  color="rose"
                  className="rounded-none gap-3 text-sm border-b"
                >
                  <AlertCircle className="size-7" />
                  <span>
                    Error: Please ensure you're using a fresh installation
                    without existing data.
                  </span>
                </Badge>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-between p-4">
                {step === 'done' ? (
                  <div className="flex justify-between w-full">
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        Close
                      </Button>
                    </DialogClose>
                    <Button asChild>
                      <a href="/" target="_blank" rel="noopener noreferrer">
                        View your storefront
                        <ArrowUpRight className="ml-1.5 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ) : (
                  <>
                    <DialogClose asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    {isLoading ? (
                      <Button disabled>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </Button>
                    ) : (
                      <Button onClick={runOnboarding}>Confirm</Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 max-h-[70vh] overflow-y-auto p-6 md:px-6 md:pb-8 md:pt-6">
            {selectedTemplate === 'custom' && step === 'template' && !customJsonApplied ? (
              /* Custom JSON Editor */
              <FullJsonEditor
                currentJson={currentJsonData}
                onJsonUpdate={(newJsonData) => {
                  setCurrentJsonData(newJsonData);
                  setCustomJsonApplied(true);
                }}
                templateName="Custom"
              />
            ) : (
              /* Unified Section Renderer Component */
              <SectionRenderer
                sections={SECTION_DEFINITIONS}
                selectedTemplate={selectedTemplate}
                isLoading={isLoading}
                loadingItems={loadingItems}
                completedItems={completedItems}
                itemErrors={itemErrors}
                error={error}
                step={step}
                currentJsonData={currentJsonData}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingDialog;
