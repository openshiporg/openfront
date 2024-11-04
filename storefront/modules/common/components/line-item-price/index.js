import { clx } from "@medusajs/ui"

const LineItemPrice = ({
  item,
  style = "default"
}) => {
  const hasReducedPrice = item.percentageOff > 0;

  return (
    <div className="flex flex-col gap-x-2 text-ui-fg-subtle items-end">
      <div className="text-left">
        {hasReducedPrice && (
          <>
            <p>
              {style === "default" && (
                <span className="text-ui-fg-subtle">Original: </span>
              )}
              <span className="line-through text-ui-fg-muted">
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
          {item.total}
        </span>
      </div>
    </div>
  );
}

export default LineItemPrice
