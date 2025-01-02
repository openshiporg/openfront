import { Container } from "@medusajs/ui";
import { formatAmount } from "@storefront/lib/util/prices";
import ChevronDown from "@storefront/modules/common/icons/chevron-down";
import LocalizedClientLink from "@storefront/modules/common/components/localized-client-link";

const Overview = ({ user, orders }) => {
  return (
    <div>
      <div className="hidden small:block">
        <div className="text-xl-semi flex justify-between items-center mb-4">
          <span>Hello {user?.firstName}</span>
          <span className="text-small-regular text-ui-fg-base">
            Signed in as: <span className="font-semibold">{user?.email}</span>
          </span>
        </div>
        <div className="flex flex-col py-8 border-t border-gray-200">
          <div className="flex flex-col gap-y-4 h-full col-span-1 row-span-2 flex-1">
            <div className="flex items-start gap-x-16 mb-6">
              <div className="flex flex-col gap-y-4">
                <h3 className="text-large-semi">Profile</h3>
                <div className="flex items-end gap-x-2">
                  <span className="text-3xl-semi leading-none">
                    {getProfileCompletion(user)}%
                  </span>
                  <span className="uppercase text-base-regular text-ui-fg-subtle">
                    Completed
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-y-4">
                <h3 className="text-large-semi">Addresses</h3>
                <div className="flex items-end gap-x-2">
                  <span className="text-3xl-semi leading-none">
                    {user?.addresses?.length || 0}
                  </span>
                  <span className="uppercase text-base-regular text-ui-fg-subtle">
                    Saved
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-y-4">
              <div className="flex items-center gap-x-2">
                <h3 className="text-large-semi">Recent orders</h3>
              </div>
              <ul className="flex flex-col gap-y-4">
                {orders && orders.length > 0 ? (
                  orders.slice(0, 5).map((order) => {
                    return (
                      <li key={order.id}>
                        <LocalizedClientLink
                          href={`/account/orders/details/${order.id}`}
                        >
                          <Container className="bg-gray-50 flex justify-between items-center p-4">
                            <div className="grid grid-cols-3 grid-rows-2 text-small-regular gap-x-4 flex-1">
                              <span className="font-semibold">Date placed</span>
                              <span className="font-semibold">
                                Order number
                              </span>
                              <span className="font-semibold">
                                Total amount
                              </span>
                              <span>
                                {new Date(order.createdAt).toDateString()}
                              </span>
                              <span>#{order.displayId}</span>
                              <span>{order.total}</span>
                            </div>
                            <button className="flex items-center justify-between">
                              <span className="sr-only">
                                Go to order #{order.id}
                              </span>
                              <ChevronDown className="-rotate-90" />
                            </button>
                          </Container>
                        </LocalizedClientLink>
                      </li>
                    );
                  })
                ) : (
                  <span>No recent orders</span>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const getProfileCompletion = (user) => {
  let count = 0;

  if (!user) {
    return 0;
  }

  if (user.email) {
    count++;
  }

  if (user.firstName && user.lastName) {
    count++;
  }

  if (user.phone) {
    count++;
  }

  if (user.billingAddress) {
    count++;
  }

  return (count / 4) * 100;
};

export default Overview;
