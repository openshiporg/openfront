import { cn } from "@/lib/utils"

interface LineItemUnitPriceProps {
  item: {
    percentageOff: number
    originalPrice: string | number
    unitPrice: string | number
  }
  style?: "default" | string
}

const LineItemUnitPrice = ({
  item,
  style = "default"
}: LineItemUnitPriceProps) => {
  const hasReducedPrice = item.percentageOff > 0

  return (
    <div className="flex flex-col text-muted-foreground justify-center h-full">
      {hasReducedPrice && (
        <>
          <p>
            {style === "default" && (
              <span className="text-muted-foreground">Original: </span>
            )}
            <span className="line-through">
              {item.originalPrice}
            </span>
          </p>
          {style === "default" && (
            <span className="text-primary">
              -{item.percentageOff}%
            </span>
          )}
        </>
      )}
      <span
        className={cn("text-base-regular", {
          "text-primary": hasReducedPrice,
        })}>
        {item.unitPrice}
      </span>
    </div>
  );
}

export default LineItemUnitPrice
