import { paymentInfoMap } from "@/features/storefront/lib/constants";
import Divider from "@/features/storefront/modules/common/components/divider";

import { StoreOrder } from "@/features/storefront/types/storefront";

const PaymentDetails = ({ order }: { order: StoreOrder }) => {
  const payment = order.payments?.[0];
  const paymentSession = payment?.paymentCollection?.paymentSessions?.find(
    (s) => s.isSelected
  );
  const provider = paymentSession?.paymentProvider;
  const giftCard = (order as any).giftCard as string | undefined;
  const currency = String((order as any).region?.currency?.code || "usd").toUpperCase();
  const cardPaid = payment
    ? new Intl.NumberFormat("en-US", { style: "currency", currency }).format((payment.amount || 0) / 100)
    : null;

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
                    : `${giftCard ? cardPaid : order.total} paid on ${new Date(
                        payment.createdAt
                      ).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}`}
                </p>
              </div>
            </div>
          </div>
        )}
        {giftCard && (
          <div className={`flex flex-col w-full sm:w-1/3 ${payment ? "mt-6" : ""}`}>
            <p className="text-sm font-medium text-foreground mb-1">Gift card</p>
            <p className="text-sm font-normal text-muted-foreground">{giftCard} paid by gift card</p>
          </div>
        )}
      </div>

      <Divider className="mt-8" />
    </div>
  );
};

export default PaymentDetails;
