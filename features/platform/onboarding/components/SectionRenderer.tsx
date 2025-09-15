import React from 'react';
import { Label } from '@/components/ui/label';
import { SectionItem } from './SectionItem';
import { SectionDefinition } from '../config/templates';
import { getItemsFromJsonData } from '../utils/dataUtils';

interface SectionRendererProps {
  sections: SectionDefinition[];
  selectedTemplate: 'full' | 'minimal' | 'custom';
  isLoading: boolean;
  loadingItems: Record<string, string[]>;
  completedItems: Record<string, string[]>;
  itemErrors: Record<string, Record<string, string>>;
  error: string | null;
  step: 'template' | 'progress' | 'done';
  currentJsonData?: any;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({
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
                {section.type === 'paymentProviders' && selectedTemplate === 'full' ? (
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
                      item="Cash on Delivery"
                      sectionType={section.type}
                      status={
                        step === 'done'
                          ? 'completed'
                          : error && itemErrors[section.type]?.['Manual']
                          ? 'error'
                          : completedItems[section.type]?.includes('Manual')
                          ? 'completed'
                          : 'normal'
                      }
                      errorMessage={itemErrors[section.type]?.['Manual']}
                      step={step}
                    />
                  </>
                ) : (
                  // Standard items rendering for all other cases
                  items.map((item) => {
                    // Determine the status of this item
                    let status: 'normal' | 'loading' | 'completed' | 'error' = 'normal';
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