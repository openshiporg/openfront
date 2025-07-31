import SkeletonOrderConfirmedHeader from "@/features/storefront/modules/skeletons/components/skeleton-order-confirmed-header"
import SkeletonOrderInformation from "@/features/storefront/modules/skeletons/components/skeleton-order-information"
import SkeletonOrderItems from "@/features/storefront/modules/skeletons/components/skeleton-order-items"

const SkeletonOrderConfirmed = () => {
  return (
    <div className="bg-gray-50 py-6 min-h-[calc(100vh-64px)] animate-pulse">
      <div className="max-w-[1440px] w-full mx-auto px-6 flex justify-center">
        <div className="max-w-4xl h-full bg-background w-full p-10">
          <SkeletonOrderConfirmedHeader />

          <SkeletonOrderItems />

          <SkeletonOrderInformation />
        </div>
      </div>
    </div>
  )
}

export default SkeletonOrderConfirmed
