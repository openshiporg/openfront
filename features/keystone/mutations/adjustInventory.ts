import { permissions } from "../access";
import { shopperError } from "../lib/shopperError";

/**
 * Moves stock by a delta in one conditional UPDATE, so a checkout reservation that lands at the same
 * moment is never overwritten. `expectedQuantity` (optional) turns it into a compare-and-set: the
 * dashboard sends the stock it showed, and a change made since (a sale, an import) is refused instead
 * of silently lost.
 */
async function adjustInventory(
  root: any,
  { variantId, delta, reason, note, expectedQuantity }: {
    variantId: string;
    delta: number;
    reason: string;
    note?: string;
    expectedQuantity?: number | null;
  },
  context: any
) {
  if (!permissions.canManageProducts({ session: context.session })) {
    throw shopperError("You don't have permission to change stock.", "ACCESS_DENIED");
  }
  if (!variantId || !Number.isInteger(delta) || delta === 0) {
    throw shopperError("Enter a whole-number stock change other than zero.", "INVENTORY_DELTA_INVALID");
  }
  if (!reason?.trim()) throw shopperError("Give a reason for the stock change.", "INVENTORY_REASON_REQUIRED");
  if (expectedQuantity !== undefined && expectedQuantity !== null && !Number.isInteger(expectedQuantity)) {
    throw shopperError("The current stock must be a whole number.", "INVENTORY_DELTA_INVALID");
  }

  await context.sudo().prisma.$transaction(async (tx: any) => {
    const variant = await tx.productVariant.findUnique({
      where: { id: variantId },
      select: { id: true, inventoryQuantity: true, allowBackorder: true },
    });
    if (!variant) throw shopperError("That variant no longer exists.", "VARIANT_NOT_FOUND");
    const casGuard = expectedQuantity !== undefined && expectedQuantity !== null;
    if (casGuard && variant.inventoryQuantity !== expectedQuantity) {
      throw shopperError(
        `Stock changed to ${variant.inventoryQuantity} since this page loaded (it showed ${expectedQuantity}). Reload and enter the new amount again.`,
        "INVENTORY_CHANGED"
      );
    }
    const negativeMessage = `Only ${variant.inventoryQuantity} in stock, so stock can't go down by ${Math.abs(delta)}. Turn on backorders to sell below zero.`;
    if (delta < 0 && !variant.allowBackorder && variant.inventoryQuantity + delta < 0) {
      throw shopperError(negativeMessage, "INVENTORY_NEGATIVE");
    }
    const quantityFilter: Record<string, number> = {};
    if (casGuard) quantityFilter.equals = expectedQuantity as number;
    if (delta < 0 && !variant.allowBackorder) quantityFilter.gte = Math.abs(delta);
    const adjusted = await tx.productVariant.updateMany({
      where: {
        id: variantId,
        ...(Object.keys(quantityFilter).length ? { inventoryQuantity: quantityFilter } : {}),
      },
      data: { inventoryQuantity: { increment: delta } },
    });
    if (adjusted.count !== 1) {
      throw shopperError(
        casGuard
          ? "Stock changed while you were saving. Reload and enter the new amount again."
          : "Stock changed while you were saving (an order may have just reserved it). Reload and try again.",
        casGuard ? "INVENTORY_CHANGED" : "INVENTORY_NEGATIVE"
      );
    }
    await tx.stockMovement.create({
      data: {
        type: delta > 0 ? "RECEIVE" : "REMOVE",
        quantity: Math.abs(delta),
        reason: reason.trim(),
        note: note?.trim() || "",
        variantId,
      },
    });
  });

  return context.query.ProductVariant.findOne({
    where: { id: variantId },
    query: "id title sku inventoryQuantity",
  });
}

export default adjustInventory;
