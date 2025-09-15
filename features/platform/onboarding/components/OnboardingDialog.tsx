'use client';

import React from 'react';
import {
  AlertCircle,
  AppWindowIcon as Apps,
  Loader2,
  Package,
  Building2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomSetupSteps } from './CustomSetupSteps';
import { SectionRenderer } from './SectionRenderer';
import { useOnboardingState } from '../hooks/useOnboardingState';
import { useOnboardingApi } from '../hooks/useOnboardingApi';
import { STORE_TEMPLATES, SECTION_DEFINITIONS } from '../config/templates';





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
  const [activeTab, setActiveTab] = React.useState(createdProviders[0] || '');

  // Filter out Cash on Delivery as it doesn't need env vars
  const providersWithEnvVars = createdProviders.filter(
    (provider) =>
      provider !== 'Cash on Delivery' && PAYMENT_PROVIDER_ENV_VARS[provider]
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
  const onboardingState = useOnboardingState();
  const {
    step,
    selectedTemplate,
    currentJsonData,
    customJsonApplied,
    progressMessage,
    loadingItems,
    completedItems,
    error,
    itemErrors,
    isLoading,
    setStep,
    setSelectedTemplate,
    setCurrentJsonData,
    setCustomJsonApplied,
    setProgress,
    setItemLoading,
    setItemCompleted,
    setItemError,
    setError,
    setIsLoading,
    resetOnboardingState,
  } = onboardingState;

  const { runOnboarding } = useOnboardingApi({
    selectedTemplate,
    currentJsonData,
    completedItems,
    setProgress,
    setItemLoading,
    setItemCompleted,
    setItemError,
    setStep,
    setError,
    setIsLoading,
    resetOnboardingState,
  });



  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-4xl gap-0 max-w-[95vw] max-h-[95vh]">
        <DialogHeader className="border-b px-4 sm:px-6 py-4 mb-0">
          <DialogTitle>Onboarding</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row">
          {/* Mobile-first layout: Store Setup header and Setup Type appear first */}
          <div className="flex flex-col lg:w-80 lg:border-r order-1 lg:order-none lg:justify-between">
            <div className="flex-1">
              <div className="p-4 sm:p-6">
                {/* Store Setup Header - Always visible first on mobile */}
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
                    
                    {/* Mobile: Dropdown selector */}
                    <div className="block lg:hidden">
                      <Select
                        value={selectedTemplate}
                        onValueChange={(value) => setSelectedTemplate(value as 'minimal' | 'full' | 'custom')}
                      >
                        <SelectTrigger className="w-full h-auto py-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minimal">
                            <div className="flex flex-col items-start text-left">
                              <span className="font-medium">Basic Setup</span>
                              <span className="text-xs text-muted-foreground">One region, one payment method, minimal products</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="full">
                            <div className="flex flex-col items-start text-left">
                              <span className="font-medium">Complete Setup</span>
                              <span className="text-xs text-muted-foreground">Multiple regions, payment methods, and products</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="custom">
                            <div className="flex flex-col items-start text-left">
                              <span className="font-medium">Custom Setup</span>
                              <span className="text-xs text-muted-foreground">Copy JSON templates to create your own setup</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Desktop: Radio Group */}
                    <div className="hidden lg:block">
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
                    </div>
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
            {/* Desktop buttons - hidden on mobile */}
            <div className="hidden lg:flex flex-col border-t mt-auto">
              {/* Error message above buttons */}
              {error && !isLoading && step !== 'done' && (
                <Badge
                  color="rose"
                  className="rounded-none gap-3 text-sm border-b"
                >
                  <AlertCircle className="size-4 sm:size-7" />
                  <span className="text-xs sm:text-sm">
                    Error: Please ensure you're using a fresh installation
                    without existing data.
                  </span>
                </Badge>
              )}

              {/* Desktop Buttons */}
              <div className="flex items-center justify-between p-4">
                {step === 'done' ? (
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <DialogClose asChild>
                      <Button type="button" variant="outline" className="w-full sm:w-auto">
                        Close
                      </Button>
                    </DialogClose>
                    <Button asChild className="w-full sm:w-auto">
                      <a href="/" target="_blank" rel="noopener noreferrer">
                        View your storefront
                        <ArrowUpRight className="ml-1.5 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <DialogClose asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    {isLoading ? (
                      <Button disabled className="w-full sm:w-auto">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </Button>
                    ) : (
                      <Button onClick={runOnboarding} className="w-full sm:w-auto">
                        Confirm
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 max-h-[60vh] lg:max-h-[70vh] overflow-y-auto p-4 sm:p-6 order-2 lg:order-none">
            {selectedTemplate === 'custom' && step === 'template' && !customJsonApplied ? (
              /* Custom Setup Steps */
              <CustomSetupSteps
                currentJson={currentJsonData}
                onJsonUpdate={(newJsonData) => {
                  setCurrentJsonData(newJsonData);
                  setCustomJsonApplied(true);
                }}
                onBack={() => setCustomJsonApplied(false)}
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

        {/* Mobile buttons - attached to bottom */}
        <div className="flex lg:hidden flex-col border-t">
          {/* Mobile Error message above buttons */}
          {error && !isLoading && step !== 'done' && (
            <Badge
              color="rose"
              className="rounded-none gap-3 text-sm border-b"
            >
              <AlertCircle className="size-4 sm:size-7" />
              <span className="text-xs sm:text-sm">
                Error: Please ensure you're using a fresh installation
                without existing data.
              </span>
            </Badge>
          )}

          {/* Mobile Buttons */}
          <div className="flex items-center justify-between p-4">
            {step === 'done' ? (
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="flex-1">
                    Close
                  </Button>
                </DialogClose>
                <Button asChild className="flex-1">
                  <a href="/" target="_blank" rel="noopener noreferrer">
                    View your storefront
                    <ArrowUpRight className="ml-1.5 h-4 w-4" />
                  </a>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                {isLoading ? (
                  <Button disabled className="flex-1">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </Button>
                ) : (
                  <Button onClick={runOnboarding} className="flex-1">
                    Confirm
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingDialog;
