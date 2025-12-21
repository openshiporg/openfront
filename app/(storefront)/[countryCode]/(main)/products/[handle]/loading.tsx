import { Skeleton } from "@/components/ui/skeleton"

export default function ProductLoading() {
  return (
    <>
      <div
        className="max-w-[1440px] w-full mx-auto px-6 flex flex-col lg:flex-row lg:items-start py-6 relative"
        data-testid="product-container-skeleton"
      >
        {/* Left column - Product info (visible on lg+) */}
        <div className="hidden lg:flex flex-col lg:sticky lg:top-48 lg:py-0 lg:max-w-[300px] w-full py-8 gap-y-6">
          {/* Product title */}
          <Skeleton className="h-8 w-3/4" />
          {/* Product price */}
          <Skeleton className="h-6 w-1/3" />
          {/* Description lines */}
          <div className="flex flex-col gap-2 mt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          {/* Product tabs skeleton */}
          <div className="mt-8">
            <div className="flex gap-4 border-b">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="py-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-2/3 mt-2" />
            </div>
          </div>
        </div>

        {/* Center - Image gallery skeleton */}
        <div className="block w-full relative">
          <div className="flex flex-col gap-4">
            {/* Main image */}
            <Skeleton className="aspect-[29/34] w-full max-w-[600px] mx-auto" />
            {/* Thumbnail row */}
            <div className="flex gap-2 justify-center">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-16 h-16" />
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Actions (visible on lg+) */}
        <div className="hidden lg:flex flex-col lg:sticky lg:top-48 lg:py-0 lg:max-w-[300px] w-full py-8 gap-y-12">
          {/* Options skeleton */}
          <div className="flex flex-col gap-y-4">
            <Skeleton className="h-5 w-16" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-16 rounded-md" />
              ))}
            </div>
          </div>
          {/* Second option */}
          <div className="flex flex-col gap-y-4">
            <Skeleton className="h-5 w-12" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-10 rounded-md" />
              ))}
            </div>
          </div>
          {/* Add to cart button */}
          <Skeleton className="h-12 w-full rounded-md" />
        </div>

        {/* Mobile/tablet layout - stacked below image */}
        <div className="flex lg:hidden flex-col w-full py-8 gap-y-8">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <div className="flex flex-col gap-y-4">
            <Skeleton className="h-5 w-16" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-16 rounded-md" />
              ))}
            </div>
          </div>
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </div>

      {/* Related products skeleton */}
      <div className="max-w-[1440px] w-full mx-auto px-6 my-16 sm:my-32">
        <Skeleton className="h-8 w-48 mb-8" />
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="animate-pulse">
              <div className="aspect-[9/16] w-full bg-gray-100" />
              <div className="flex justify-between text-sm leading-6 font-normal mt-2">
                <div className="w-2/5 h-6 bg-gray-100" />
                <div className="w-1/5 h-6 bg-gray-100" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
