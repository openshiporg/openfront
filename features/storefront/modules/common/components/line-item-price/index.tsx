import { cn } from "@/lib/utils";

interface LineItemPriceProps {
  item: {
    percentageOff: number;
    originalPrice: string | number;
    total: string | number;
  };
  style?: "default" | string;
}

const LineItemPrice = ({
  item,
  style = "default"
}: LineItemPriceProps) => {
  const hasReducedPrice = item.percentageOff > 0;

  return (
    <div className="flex flex-col gap-x-2 text-muted-foreground items-end">
      <div className="text-left">
        {hasReducedPrice && (
          <>
            <p>
              {style === "default" && (
                <span className="text-muted-foreground">Original: </span>
              )}
              <span className="line-through text-muted-foreground">
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
          {item.total}
        </span>
      </div>
    </div>
  );
}

export default LineItemPrice
