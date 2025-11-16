import { paymentInfoMap } from "@/features/storefront/lib/constants";
import Divider from "@/features/storefront/modules/common/components/divider";

import { StoreOrder } from "@/features/storefront/types/storefront";

const PaymentDetails = ({ order }: { order: StoreOrder }) => {
  const payment = order.payments?.[0];
  const paymentSession = payment?.paymentCollection?.paymentSessions?.find(
    (s) => s.isSelected
  );
  const provider = paymentSession?.paymentProvider;

  return (
    <div>
      <h2 className="flex flex-row text-3xl font-medium my-6">Payment</h2>
      <div>
        {payment && provider?.code && (
          <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-x-8 w-full">
            <div className="flex flex-col w-full sm:w-1/3">
              <p className="text-sm font-medium text-foreground mb-1">
                Payment Method
              </p>
              <p className="text-sm font-normal text-muted-foreground">
                {paymentInfoMap[provider.code]?.title}
              </p>
            </div>
            <div className="flex flex-col w-full sm:w-2/3">
              <p className="text-sm font-medium text-foreground mb-1">
                Payment Details
              </p>
              <div className="flex items-center text-sm font-normal text-muted-foreground">
                <div className="flex items-center h-7 w-fit mr-4">
                  {paymentInfoMap[provider.code]?.icon}
                </div>
                <p>
                  {provider.code === "stripe" && payment.data.cardLast4
                    ? `**** **** **** ${payment.data.cardLast4}`
                    : `${order.total} paid at ${new Date(
                        payment.createdAt
                      ).toString()}`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Divider className="mt-8" />
    </div>
  );
};

export default PaymentDetails;
