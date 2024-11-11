import { clx } from "@medusajs/ui"


const LineItemUnitPrice = ({
  item,
  region,
  style = "default"
}) => {
  const hasReducedPrice = item.percentageOff > 0

  return (
    <div className="flex flex-col text-ui-fg-muted justify-center h-full">
      {hasReducedPrice && (
        <>
          <p>
            {style === "default" && (
              <span className="text-ui-fg-muted">Original: </span>
            )}
            <span className="line-through">
              {item.originalPrice}
            </span>
          </p>
          {style === "default" && (
            <span className="text-ui-fg-interactive">
              -{item.percentageOff}%
            </span>
          )}
        </>
      )}
      <span
        className={clx("text-base-regular", {
          "text-ui-fg-interactive": hasReducedPrice,
        })}>
        {item.unitPrice}
      </span>
    </div>
  );
}

export default LineItemUnitPrice
