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

export default async function Logo() {
  const store = await getStore();
  const storeName = store?.name || 'Openfront Store';
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
      <svg
        width="14"
        height="14"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_238_1296)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M100 0H0L100 100H0L100 200H200L100 100H200L100 0Z"
            fill="url(#paint0_linear_238_1296)"
          />
        </g>
        <defs>
          <linearGradient
            id="paint0_linear_238_1296"
            x1="20.5"
            y1="16"
            x2="100"
            y2="200"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#2b7fff" />
            <stop offset="1" stopColor="#4f39f6" />
          </linearGradient>
          <clipPath id="clip0_238_1296">
            <rect width="200" height="200" fill="white" />
          </clipPath>
        </defs>
      </svg>
      <h1 className="flex items-center tracking-wide text-lg">
        <span className="font-medium">{first.toLowerCase()}</span>
        {second && (
          <>
            <span className="mx-1.5 text-base text-muted-foreground">x</span>
            <span className="font-light">{second.toLowerCase()}</span>
          </>
        )}
      </h1>
    </LocalizedClientLink>
  );
}
