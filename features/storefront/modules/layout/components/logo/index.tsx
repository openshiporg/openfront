import { cn } from '@/lib/utils';
import { Tektur } from 'next/font/google';
import LocalizedClientLink from '@/features/storefront/modules/common/components/localized-client-link';
import { getStore } from '@/features/storefront/lib/data/store';
import { formatStoreName } from '@/features/storefront/lib/utils/store';

const tektur = Tektur({
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
});

const DEFAULT_LOGO = '<svg fill="none" height="100%" viewBox="0 0 44 48" width="100%" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="m17.6264 6.5h14.8017l11.4661 18.6661-15.7786 15.9489-22.68835-4.0459-5.157719-19.2098zm.5273 4.9692-6.816 15.105 6.4504 5.3411 8.8246-3.7975zm12.3276 15.3 9.2139-2.7073-7.1983-11.7184zm-.6163-17.2692h-9.3468l7.3309 14.4284zm6.9795 18.5263-6.779 1.9919-.5448 5.4109zm-10.5005 9.008.5824-5.7856-6.0573 2.6067zm-6.8394-.5022-10.91261-1.9459 1.64741-5.0264 6.438 5.3308zm-11.69782-9.1824-2.7037-3.0571 1.66868 6.215zm-3.53432-8.5248 4.81433 5.4437 5.50351-12.1963z" fill="#155eef" fill-rule="evenodd"/></svg>';

export default async function Logo() {
  const store = await getStore();
  const storeName = store?.name || 'Openfront Store';
  const logoSvg = store?.logoIcon || DEFAULT_LOGO;
  const logoColor = store?.logoColor || '0';
  const { first, second } = formatStoreName(storeName);

  return (
    <LocalizedClientLink
      href="/"
      className={cn(
        tektur.className,
        'flex items-center gap-2 text-2xl text-foreground hover:text-muted-foreground opacity-75'
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
