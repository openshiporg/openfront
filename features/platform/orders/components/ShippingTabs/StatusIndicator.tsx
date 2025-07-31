'use client';

import { cn } from '@/lib/utils';
import type { ShippingProvider } from '../../types';

interface StatusIndicatorProps {
  provider: Partial<ShippingProvider> & { id: string; name: string };
  isPreset?: boolean;
}

export function StatusIndicator({ provider, isPreset }: StatusIndicatorProps) {
  if (isPreset && !provider?.isActive) {
    return (
      <span className="inline-block w-2.5 h-2.5 rounded-full border-2 bg-zinc-200 border-zinc-300" />
    );
  }

  return (
    <span
      className={cn(
        'inline-block w-2.5 h-2.5 rounded-full border-2',
        provider?.isActive
          ? 'bg-green-500 border-green-300'
          : 'bg-red-500 border-red-300'
      )}
    />
  );
}