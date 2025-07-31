interface LineItemOptionsProps {
  variant?: {
    sku?: string
  }
  variantTitle?: string
}

const LineItemOptions = ({
  variant,
  variantTitle
}: LineItemOptionsProps) => {
  return (
    <div className="text-muted-foreground">
      {variantTitle && (
        <p className="inline-block w-full overflow-hidden text-ellipsis">
          {variantTitle}
        </p>
      )}
      {variant?.sku && (
        <p className="inline-block w-full overflow-hidden text-ellipsis">
          SKU: {variant.sku}
        </p>
      )}
    </div>
  )
}

export default LineItemOptions
