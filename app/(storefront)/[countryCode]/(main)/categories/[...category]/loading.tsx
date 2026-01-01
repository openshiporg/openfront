import { Skeleton } from "@/components/ui/skeleton"

export default function CategoryLoading() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start py-6 max-w-[1440px] w-full mx-auto px-6">
      {/* Refinement list / Sort sidebar skeleton */}
      <div className="flex lg:flex-col gap-12 py-4 mb-8 lg:px-0 pl-6 lg:min-w-[250px] lg:ml-[1.675rem] lg:mt-14">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-20 mb-2" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      {/* Main content */}
      <div className="w-full">
        {/* Category title skeleton */}
        <div className="mb-8 text-3xl font-semibold">
          <Skeleton className="h-9 w-64" />
        </div>

        {/* Product grid skeleton */}
        <ul className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8 flex-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <li key={i} className="animate-pulse">
              <div className="aspect-[9/16] w-full bg-gray-100" />
              <div className="flex justify-between text-sm leading-6 font-normal mt-2">
                <div className="w-2/5 h-6 bg-gray-100" />
                <div className="w-1/5 h-6 bg-gray-100" />
              </div>
            </li>
          ))}
        </ul>

        {/* Pagination skeleton */}
        <div className="flex justify-center items-center gap-4 mt-12">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  )
}
