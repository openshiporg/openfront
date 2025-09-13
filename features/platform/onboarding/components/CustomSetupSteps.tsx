import React, { useState } from 'react';
import { Copy, Check, Clipboard, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import seedData from '@/features/platform/onboarding/lib/seed.json';

interface CustomSetupStepsProps {
  currentJson?: any;
  onJsonUpdate?: (newJson: any) => void;
  onBack?: () => void;
}

function useCopyToClipboard(): [string | null, (text: string) => Promise<boolean>] {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copy = React.useCallback(async (text: string) => {
    if (!navigator?.clipboard) {
      console.warn("Clipboard not supported");
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      return true;
    } catch (error) {
      console.warn("Copy failed", error);
      setCopiedText(null);
      return false;
    }
  }, []);

  return [copiedText, copy];
}

// Get complete setup configuration from seed data
function getCompleteSetupJson() {
  const completeRegionCodes = ['na', 'eu', 'uk'];
  const completePaymentProviders = ['pp_stripe_stripe', 'pp_paypal_paypal', 'pp_system_default'];
  const completeShipping = ['Standard Shipping', 'Express Shipping', 'Return Shipping'];
  const completeCategories = ['shirts', 'hoodies', 'accessories', 'pants'];
  const completeCollections = ['latest-picks', 'new-arrivals', 'trending'];
  const completeProducts = [
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
  ];

  // Filter products and clean up variant prices to only include relevant regions
  const filteredProducts = (seedData.products as any[])
    .filter((p: any) => completeProducts.includes(p.handle))
    .map((product: any) => ({
      ...product,
      variants: product.variants.map((variant: any) => ({
        ...variant,
        prices: variant.prices.filter((price: any) =>
          completeRegionCodes.includes(price.regionCode)
        )
      }))
    }));

  return {
    store: {
      name: 'Impossible Tees',
      defaultCurrencyCode: 'usd',
      homepageTitle: 'Modern Apparel Store',
      homepageDescription: 'Quality clothing and unique designs.',
    },
    regions: (seedData.regions as any[]).filter((r: any) =>
      completeRegionCodes.includes(r.code)
    ),
    paymentProviders: (seedData.paymentProviders as any[]).filter((p: any) =>
      completePaymentProviders.includes(p.code)
    ),
    shipping_options: (seedData.shipping_options as any[]).filter((s: any) =>
      completeShipping.includes(s.name)
    ),
    categories: (seedData.categories as any[]).filter((c: any) =>
      completeCategories.includes(c.handle)
    ),
    collections: (seedData.collections as any[]).filter((c: any) =>
      completeCollections.includes(c.handle)
    ),
    products: filteredProducts,
  };
}

export function CustomSetupSteps({
  currentJson,
  onJsonUpdate = () => {},
  onBack
}: CustomSetupStepsProps) {
  const [, copy] = useCopyToClipboard();
  const [copiedItems, setCopiedItems] = useState<Record<string, boolean>>({});
  const [customJson, setCustomJson] = useState('');
  const [jsonError, setJsonError] = useState('');

  // Use complete setup JSON as the base
  const completeJson = getCompleteSetupJson();

  const copyToClipboard = async (text: string, itemKey: string) => {
    try {
      const success = await copy(text);
      if (success) {
        setCopiedItems(prev => ({ ...prev, [itemKey]: true }));
        setTimeout(() => {
          setCopiedItems(prev => ({ ...prev, [itemKey]: false }));
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Generate the AI prompt focused on user questions rather than editing existing JSON
  const generateAIPrompt = () => {
    return `I need help customizing my e-commerce store configuration. Here's my current complete setup:

${JSON.stringify(completeJson, null, 2)}

**Your first response should be:**

Start by telling me what this JSON configuration currently contains:

**STORE INFORMATION:**
- Store Name: Impossible Tees
- Default Currency: USD
- Homepage Title: Modern Apparel Store
- Homepage Description: Quality clothing and unique designs.

**REGIONS & CURRENCIES:**
- North America (USD, $) - United States, Canada - 5% tax rate
- Europe (EUR, €) - Germany, France, Italy - 8.5% tax rate
- United Kingdom (GBP, £) - United Kingdom - 7% tax rate

**PAYMENT PROVIDERS:**
- Stripe (credit/debit cards)
- PayPal (PayPal payments)
- Cash on Delivery (manual payment)

**SHIPPING OPTIONS:**
- Standard Shipping: $10.00
- Express Shipping: $15.00
- Return Shipping: $10.00

**PRODUCT CATEGORIES:**
- Shirts, Hoodies, Accessories, Pants

**COLLECTIONS:**
- Latest Picks, New Arrivals, Trending

**PRODUCTS (10 items):**
- Penrose Triangle T-Shirt
- Escher's Staircase Hoodie
- Möbius Strip Scarf
- Fibonacci Spiral Crop Top
- Quantum Entanglement Socks
- Schrödinger's Cat Tank Top
- Klein Bottle Beanie
- Paradox Puzzle Sweater
- Heisenberg's Uncertainty Principle Joggers
- Mandelbrot Set Infinity Shawl

Then ask: "This is what your store configuration currently has. What would you like to change?"

After I tell you what to change, modify the JSON and provide the complete updated configuration for me to paste into Openfront.`;
  };

  const [jsonApplied, setJsonApplied] = useState(false);

  const validateAndApplyJson = () => {
    try {
      const parsed = JSON.parse(customJson);

      const requiredKeys = ['store', 'regions', 'paymentProviders', 'shipping_options', 'categories', 'products'];
      const missingKeys = requiredKeys.filter(key => {
        if (key === 'store') {
          return !parsed[key] || typeof parsed[key] !== 'object';
        }
        return !parsed[key] || !Array.isArray(parsed[key]);
      });

      if (missingKeys.length > 0) {
        setJsonError(`Missing required keys: ${missingKeys.join(', ')}`);
        return;
      }

      onJsonUpdate(parsed);
      setJsonApplied(true);
      setJsonError('');
    } catch (err) {
      setJsonError('Invalid JSON format. Please check your syntax.');
    }
  };

  const steps = [
    {
      number: 1,
      title: "Copy Base Configuration",
      description: "Start with our complete template JSON configuration",
      content: (
        <div className="bg-background rounded-lg border">
          <div className="flex items-center justify-between p-3 bg-muted border-b">
            <span className="text-sm font-medium text-muted-foreground">Onboarding Data</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(JSON.stringify(completeJson, null, 2), 'json')}
              className="h-4 w-4 p-0 hover:bg-background/80"
            >
              {copiedItems.json ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground" />
              )}
            </Button>
          </div>
          <div className="p-3">
            <pre className="text-xs overflow-auto h-[200px] whitespace-pre-wrap break-words text-foreground">
              <code>{JSON.stringify(completeJson, null, 2)}</code>
            </pre>
          </div>
        </div>
      )
    },
    {
      number: 2,
      title: "Copy AI Customization Prompt",
      description: "Use this prompt with any AI assistant to get your custom configuration",
      content: (
        <div className="bg-background rounded-lg border">
          <div className="flex items-center justify-between p-3 bg-muted border-b">
            <span className="text-sm font-medium text-muted-foreground">AI Prompt</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(generateAIPrompt(), 'prompt')}
              className="h-4 w-4 p-0 hover:bg-background/80"
            >
              {copiedItems.prompt ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground" />
              )}
            </Button>
          </div>
          <div className="p-3">
            <div className="text-xs overflow-auto h-[200px] whitespace-pre-wrap break-words text-foreground">
              {generateAIPrompt()}
            </div>
          </div>
        </div>
      )
    },
    {
      number: 3,
      title: "Chat with AI",
      description: "The AI will ask you questions about your business and products, what regions you want to sell in, and help you customize your setup",
      content: (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            The AI will ask you questions about your business such as:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
            <li>• What products do you want to sell?</li>
            <li>• Which regions/countries do you want to target?</li>
            <li>• What product categories do you need?</li>
            <li>• What payment methods do you prefer?</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Answer the AI's questions to get your custom JSON configuration.
          </p>
        </div>
      )
    },
    {
      number: 4,
      title: "Paste Your Custom JSON",
      description: "Paste the AI-generated configuration here",
      content: (
        <div className="bg-background rounded-lg border">
          <div className="flex items-center justify-between p-3 bg-muted border-b">
            <span className="text-sm font-medium text-muted-foreground">Custom Onboarding Data</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  setCustomJson(text);
                  setJsonError('');
                } catch (err) {
                  console.error('Failed to paste:', err);
                }
              }}
              className="h-4 w-4 p-0 hover:bg-background/80"
            >
              <Clipboard className="h-3 w-3 text-muted-foreground" />
            </Button>
          </div>
          <div className="p-3">
            <Textarea
              placeholder="Paste your customized JSON configuration here..."
              value={customJson}
              onChange={(e) => {
                setCustomJson(e.target.value);
                setJsonError('');
              }}
              className="min-h-[200px] font-mono text-xs resize-none border-0 p-0 bg-transparent focus:outline-none"
            />
          </div>
          {jsonError && (
            <div className="px-3 pb-3">
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-2">
                <p className="text-xs text-destructive">{jsonError}</p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-end p-3 bg-muted border-t">
            <Button
              size="sm"
              onClick={validateAndApplyJson}
              disabled={!customJson.trim()}
            >
              Apply Configuration
            </Button>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {jsonApplied && onBack && (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setJsonApplied(false);
              onBack();
            }}
            className="h-8 px-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Custom Setup
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-sm font-medium">Custom Setup Configuration</Label>
        <p className="text-xs text-muted-foreground">
          Follow these steps to create a personalized store setup using AI assistance.
        </p>
      </div>

      <div className="space-y-0">
        {steps.map((step, index) => (
          <div key={step.number} className="relative">
            {/* Connecting line between sections */}
            {index < steps.length - 1 && (
              <div className="absolute left-3 top-3 bottom-0 w-[1px] bg-border"></div>
            )}

            {/* Section header with number badge */}
            <div className="flex items-center space-x-3 mb-2 relative">
              <div className="inline-flex size-6 items-center justify-center rounded-sm border border-border bg-background text-sm text-foreground shadow-sm z-10">
                {step.number}
              </div>
              <Label className="text-sm font-medium text-foreground">
                {step.title}
              </Label>
            </div>

            {/* Section items */}
            <div className="pl-9">
              <div className="pb-6">
                <p className="text-xs text-muted-foreground mb-3">{step.description}</p>
                {step.content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}