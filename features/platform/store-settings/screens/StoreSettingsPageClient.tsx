'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import * as SelectPrimitive from '@radix-ui/react-select';
import { LOGO_ICONS, HUE_PRESETS } from '../lib/icon-registry';
import { updateStoreSettings } from '../actions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Code } from 'lucide-react';

interface StoreSettingsPageClientProps {
  initialData: {
    id: string;
    name: string;
    logoIcon: string;
    logoColor: string;
    homepageTitle: string;
    homepageDescription: string;
  } | null;
  initialError: string | null;
}

export function StoreSettingsPageClient({
  initialData,
  initialError,
}: StoreSettingsPageClientProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [logoIcon, setLogoIcon] = useState(
    initialData?.logoIcon || LOGO_ICONS[0].lightSvg
  );
  const [logoColor, setLogoColor] = useState(
    initialData?.logoColor || '0'
  );
  const [homepageTitle, setHomepageTitle] = useState(
    initialData?.homepageTitle || ''
  );
  const [homepageDescription, setHomepageDescription] = useState(
    initialData?.homepageDescription || ''
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!initialData?.id) {
      toast.error('No store found to update');
      return;
    }

    setIsLoading(true);
    const result = await updateStoreSettings(initialData.id, {
      name,
      logoIcon,
      logoColor,
      homepageTitle,
      homepageDescription,
    });

    if (result.success) {
      toast.success('Store settings updated successfully');
    } else {
      toast.error(result.error || 'Failed to update store settings');
    }
    setIsLoading(false);
  };

  if (initialError) {
    return (
      <div className="p-6">
        <div className="text-red-500">Error: {initialError}</div>
      </div>
    );
  }

  // Find matching preset icon, but don't default to first icon if not found
  const selectedIcon = LOGO_ICONS.find((icon) => icon.lightSvg === logoIcon);

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Store Settings</h1>

      <div className="space-y-6">
        {/* Store Name */}
        <div>
          <Label htmlFor="store-name">Store Name</Label>
          <Input
            id="store-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2"
          />
        </div>

        {/* Logo Icon Selector */}
        <div>
          <Label>Logo Icon</Label>
          <div className="mt-2 flex items-center gap-2">
            <Select
              value={selectedIcon?.id || ''}
              onValueChange={(id) => {
                const icon = LOGO_ICONS.find((i) => i.id === id);
                if (icon) setLogoIcon(icon.lightSvg);
              }}
            >
              <SelectPrimitive.Trigger
                className={cn(
                  'flex h-12 w-12 shrink-0 rounded-lg border border-input bg-background focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 p-0 overflow-hidden items-center justify-center'
                )}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: logoIcon }}
                  style={{ filter: `hue-rotate(${logoColor}deg)` }}
                  className="[&>svg]:w-6 [&>svg]:h-6"
                />
              </SelectPrimitive.Trigger>
              <SelectContent className="border-border dark:border-blue-700">
                {LOGO_ICONS.map((icon) => (
                  <SelectItem key={icon.id} value={icon.id}>
                    <span className="flex items-center gap-3">
                      <div
                        dangerouslySetInnerHTML={{ __html: icon.lightSvg }}
                        style={{ filter: `hue-rotate(${logoColor}deg)` }}
                        className="[&>svg]:w-6 [&>svg]:h-6"
                      />
                      <span>
                        <span className="block font-medium text-gray-900 dark:text-gray-100">
                          {icon.name}
                        </span>
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* SVG Code Editor Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 shrink-0"
                  type="button"
                >
                  <Code className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[500px]" align="start">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Edit SVG Code</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Edit the SVG code directly. Changes will be reflected in the icon preview.
                    </p>
                  </div>
                  <Textarea
                    value={logoIcon}
                    onChange={(e) => setLogoIcon(e.target.value)}
                    className="font-mono text-xs min-h-[300px]"
                    placeholder="<svg>...</svg>"
                  />
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">Preview:</div>
                    <div
                      dangerouslySetInnerHTML={{ __html: logoIcon }}
                      style={{ filter: `hue-rotate(${logoColor}deg)` }}
                      className="[&>svg]:w-8 [&>svg]:h-8 flex items-center justify-center p-2 border rounded"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Logo Color Selector */}
        <div>
          <Label>Logo Color</Label>
          <div className="mt-2">
            <Select
              value={logoColor}
              onValueChange={(value) => setLogoColor(value)}
            >
              <SelectPrimitive.Trigger
                className={cn(
                  'flex h-12 w-12 shrink-0 rounded-lg border border-input bg-background focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 p-0 overflow-hidden items-center justify-center'
                )}
              >
                <SelectValue>
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{
                      background: `hsl(${(240 + parseInt(logoColor)) % 360}, 70%, 50%)`
                    }}
                  />
                </SelectValue>
              </SelectPrimitive.Trigger>
              <SelectContent className="border-border dark:border-blue-700">
                <div className="grid grid-cols-4 gap-2 p-2">
                  {HUE_PRESETS.map((preset) => (
                    <SelectItem
                      key={preset.value}
                      value={preset.value.toString()}
                      className="cursor-pointer p-0 h-12 w-12 flex items-center justify-center [&>span:first-child]:hidden"
                    >
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{
                          background: `hsl(${(240 + preset.value) % 360}, 70%, 50%)`
                        }}
                      />
                    </SelectItem>
                  ))}
                </div>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Homepage Title */}
        <div>
          <Label htmlFor="homepage-title">Homepage Title</Label>
          <Input
            id="homepage-title"
            value={homepageTitle}
            onChange={(e) => setHomepageTitle(e.target.value)}
            className="mt-2"
          />
        </div>

        {/* Homepage Description */}
        <div>
          <Label htmlFor="homepage-description">Homepage Description</Label>
          <Input
            id="homepage-description"
            value={homepageDescription}
            onChange={(e) => setHomepageDescription(e.target.value)}
            className="mt-2"
          />
        </div>

        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
