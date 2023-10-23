export const canBuy = (variant) => {
  return variant.inventory_quantity > 0 || variant.allow_backorder === true
}
