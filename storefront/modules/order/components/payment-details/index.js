import { Container, Heading, Text } from "@medusajs/ui"
import { formatAmount } from "@storefront/lib/util/prices"

import { paymentInfoMap } from "@storefront/lib/constants"
import Divider from "@storefront/modules/common/components/divider"

const PaymentDetails = ({
  order
}) => {
  const payment = order.payments[0]
  const paymentSession = payment?.paymentCollection?.paymentSessions?.find(s => s.isSelected)
  const provider = paymentSession?.paymentProvider

  return (
    <div>
      <Heading level="h2" className="flex flex-row text-3xl-regular my-6">
        Payment
      </Heading>
      <div>
        {payment && provider && (
          <div className="flex items-start gap-x-1 w-full">
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Payment method
              </Text>
              <Text className="txt-medium text-ui-fg-subtle">
                {paymentInfoMap[provider.code]?.title}
              </Text>
            </div>
            <div className="flex flex-col w-2/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Payment details
              </Text>
              <div className="flex gap-2 txt-medium text-ui-fg-subtle items-center">
                <Container className="flex items-center h-7 w-fit p-2 bg-ui-button-neutral-hover">
                  {paymentInfoMap[provider.code]?.icon}
                </Container>
                <Text>
                  {provider.code === "stripe" && payment.data.cardLast4
                    ? `**** **** **** ${payment.data.cardLast4}`
                    : `${order.total} paid at ${new Date(payment.createdAt).toString()}`}
                </Text>
              </div>
            </div>
          </div>
        )}
      </div>

      <Divider className="mt-8" />
    </div>
  );
}

export default PaymentDetails
