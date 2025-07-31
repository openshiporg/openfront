import ChevronDown from "@/features/storefront/modules/common/icons/chevron-down" 
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link" 
import { formatAmount } from "@/features/storefront/lib/util/prices" // Added formatAmount
import { CustomerProfile, OrderSummary, OrdersList } from "@/features/storefront/types/account" // Import new types
 
type OverviewProps = {
  user: CustomerProfile
  orders: OrdersList
}

const Overview = ({ user, orders }: OverviewProps) => {
  return (
    <div data-testid="overview-page-wrapper">
      <div className="hidden sm:block">
        <div className="text-2xl leading-[36px] font-semibold flex justify-between items-center mb-4">
          <span data-testid="welcome-message" data-value={user?.firstName}>
            Hello {user?.firstName}
          </span>
          <span className="text-xs leading-5 font-normal text-foreground">
            Signed in as:{" "}
            <span
              className="font-semibold"
              data-testid="customer-email"
              data-value={user?.email}
            >
              {user?.email}
            </span>
          </span>
        </div>
        <div className="flex flex-col py-8 border-t border-gray-200">
          <div className="flex flex-col gap-y-4 h-full col-span-1 row-span-2 flex-1">
            <div className="flex items-start gap-x-16 mb-6">
              <div className="flex flex-col gap-y-4">
                <h3 className="text-base leading-6 font-semibold">Profile</h3>
                <div className="flex items-end gap-x-2">
                  <span
                    className="text-3xl font-semibold leading-none"
                    data-testid="customer-profile-completion"
                    data-value={getProfileCompletion(user)}
                  >
                    {getProfileCompletion(user)}%
                  </span>
                  <span className="uppercase text-sm leading-6 font-normal text-muted-foreground">
                    Completed
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-y-4">
                <h3 className="text-base leading-6 font-semibold">Addresses</h3>
                <div className="flex items-end gap-x-2">
                  <span
                    className="text-3xl font-semibold leading-none"
                    data-testid="addresses-count"
                    data-value={user?.addresses?.length || 0}
                  >
                    {user?.addresses?.length || 0}
                  </span>
                  <span className="uppercase text-sm leading-6 font-normal text-muted-foreground">
                    Saved
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-y-4">
              <div className="flex items-center gap-x-2">
                <h3 className="text-base leading-6 font-semibold">Recent orders</h3>
              </div>
              <ul
                className="flex flex-col gap-y-4"
                data-testid="orders-wrapper"
              >
                {orders && orders.length > 0 ? (
                  orders.slice(0, 5).map((order: OrderSummary) => {
                    return (
                      <li
                        key={order.id}
                        data-testid="order-wrapper"
                        data-value={order.id}
                      >
                        <LocalizedClientLink
                          href={`/account/orders/details/${order.id}`}
                        >
                          <div className="bg-muted/40 border rounded-md shadow-xs flex justify-between items-center p-4">
                            <div className="grid grid-cols-3 grid-rows-2 text-xs leading-5 font-normal gap-x-4 flex-1">
                              <span className="font-semibold">Date placed</span>
                              <span className="font-semibold">
                                Order number
                              </span>
                              <span className="font-semibold">
                                Total amount
                              </span>
                              <span data-testid="order-created-date">
                                {new Date(order.createdAt).toDateString()}
                              </span>
                              <span
                                data-testid="order-id"
                                data-value={order.displayId}
                              >
                                #{order.displayId}
                              </span>
                              <span data-testid="order-amount">
                              <span>{order.total}</span>
                              </span>
                            </div>
                            <button
                              className="flex items-center justify-between"
                              data-testid="open-order-button"
                            >
                              <span className="sr-only">
                                Go to order #{order.displayId}
                              </span>
                              <ChevronDown className="-rotate-90" />
                            </button>
                          </div>
                        </LocalizedClientLink>
                      </li>
                    )
                  })
                ) : (
                  <span data-testid="no-orders-message">No recent orders</span>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const getProfileCompletion = (user: CustomerProfile) => {
  let count = 0

  if (!user) {
    return 0
  }

  if (user.email) {
    count++
  }

  if (user.firstName && user.lastName) {
    count++
  }

  if (user.phone) {
    count++
  }

  if (user.billingAddress) {
    count++
  }

  return (count / 4) * 100
}

export default Overview