import { Skeleton } from "@/components/ui/skeleton"

export default function HomeLoading() {
  return (
    <>
      {/* Hero skeleton - matches the actual Hero component */}
      <div className="h-[75vh] w-full border-b border-border relative bg-slate-950">
        {/* Background gradient effect */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at center, rgb(59, 130, 246) 0%, transparent 70%)`,
          }}
        />

        {/* Flickering grid skeleton - simplified version */}
        <div className="absolute inset-0 opacity-30">
          <div 
            className="w-full h-full animate-pulse"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(59, 130, 246, 0.3) 1px, transparent 1px)`,
              backgroundSize: '6px 6px',
            }}
          />
        </div>

        {/* Text content skeleton */}
        <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center sm:p-32 gap-6">
          <span className="flex flex-col items-center gap-2">
            <Skeleton className="h-10 w-80 bg-white/10" />
            <Skeleton className="h-7 w-96 bg-blue-200/20 mt-2" />
          </span>
        </div>
      </div>

      {/* Featured products skeleton - matches ProductRail layout */}
      <div className="py-12">
        {/* First collection */}
        <div className="max-w-[1440px] w-full mx-auto px-6 py-12 sm:py-24">
          <div className="flex justify-between mb-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-16" />
          </div>
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
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

        {/* Second collection */}
        <div className="max-w-[1440px] w-full mx-auto px-6 py-12 sm:py-24">
          <div className="flex justify-between mb-8">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-6 w-16" />
          </div>
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
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

        {/* Third collection */}
        <div className="max-w-[1440px] w-full mx-auto px-6 py-12 sm:py-24">
          <div className="flex justify-between mb-8">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-6 w-16" />
          </div>
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
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
      </div>
    </>
  )
}
