import { formatAmount } from "@storefront/lib/util/prices"
import { clx } from "@medusajs/ui"

import { getPercentageDiff } from "@storefront/lib/util/get-precentage-diff"

const LineItemUnitPrice = ({
  item,
  region,
  style = "default"
}) => {
  const originalPrice = (item.productVariant).originalPrice
  const hasReducedPrice = (originalPrice * item.quantity || 0) > item.total
  const reducedPrice = (item.total || 0) / item.quantity

  return (
    <div className="flex flex-col text-ui-fg-muted justify-center h-full">
      {hasReducedPrice && (
        <>
          <p>
            {style === "default" && (
              <span className="text-ui-fg-muted">Original: </span>
            )}
            <span className="line-through">
              {formatAmount({
                amount: originalPrice,
                region: region,
                includeTaxes: false,
              })}
            </span>
          </p>
          {style === "default" && (
            <span className="text-ui-fg-interactive">
              -{getPercentageDiff(originalPrice, reducedPrice || 0)}%
            </span>
          )}
        </>
      )}
      <span
        className={clx("text-base-regular", {
          "text-ui-fg-interactive": hasReducedPrice,
        })}>
        {formatAmount({
          amount: reducedPrice || item.unitPrice || 0,
          region: region,
          includeTaxes: false,
        })}
      </span>
    </div>
  );
}

export default LineItemUnitPrice
