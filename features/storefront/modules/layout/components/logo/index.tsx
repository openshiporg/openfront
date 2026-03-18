import { cn } from '@/lib/utils';
import { Tektur } from 'next/font/google';
import LocalizedClientLink from '@/features/storefront/modules/common/components/localized-client-link';
import { getStore } from '@/features/storefront/lib/data/store';
import { formatStoreName } from '@/features/storefront/lib/utils/store';
import { SYSmoAILogo, SYSmoAIWordmark } from '@/components/ui/sysmoai-logo';

const tektur = Tektur({
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
});

const SYSMOAI_SVG = `<svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M25 34 L50 24 L75 34 L75 54 L50 64 L25 54 Z" fill="#1E3A8A" fill-opacity="0.08" stroke="#1E40AF" stroke-opacity="0.35" stroke-width="3" stroke-linejoin="round"/><path d="M30 49 L50 40 L70 49 L70 64 L50 73 L30 64 Z" fill="#2563EB" fill-opacity="0.15" stroke="#2563EB" stroke-opacity="0.55" stroke-width="3" stroke-linejoin="round"/><path d="M40 61 L50 56 L60 61 L60 71 L50 76 L40 71 Z" fill="#1E3A8A" fill-opacity="0.85" stroke="#1E3A8A" stroke-opacity="1" stroke-width="3" stroke-linejoin="round"/></svg>`;

export default async function Logo() {
  const store = await getStore();
  const storeName = store?.name || 'SYSmoAI';
  const logoSvg = store?.logoIcon || SYSMOAI_SVG;
  const logoColor = store?.logoColor || '0';
  const { first, second } = formatStoreName(storeName);

  if (!store?.name) {
    return (
      <LocalizedClientLink
        href="/"
        className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
        data-testid="nav-store-link"
      >
        <div className="size-5 sm:size-6">
          <SYSmoAILogo size={24} variant="brand-light" />
        </div>
        <SYSmoAIWordmark size={16} color="#030213" />
      </LocalizedClientLink>
    );
  }

  return (
    <LocalizedClientLink
      href="/"
      className={cn(
        tektur.className,
        'flex items-center gap-2 text-2xl text-foreground hover:text-muted-foreground opacity-75 cursor-pointer'
      )}
      data-testid="nav-store-link"
    >
      <div
        dangerouslySetInnerHTML={{ __html: logoSvg }}
        style={{ filter: `hue-rotate(${logoColor}deg)` }}
        className="size-4 sm:size-5"
      />
      <h1 className="flex items-center tracking-wide text-base sm:text-lg">
        <span className="font-medium">{first.toLowerCase()}</span>
        {second && (
          <>
            <span className="mx-1.5 text-sm sm:text-base text-muted-foreground">x</span>
            <span className="font-light">{second.toLowerCase()}</span>
          </>
        )}
      </h1>
    </LocalizedClientLink>
  );
}
