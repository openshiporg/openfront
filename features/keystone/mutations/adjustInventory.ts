import { permissions } from "../access";

async function adjustInventory(
  root: any,
  { variantId, delta, reason, note }: {
    variantId: string;
    delta: number;
    reason: string;
    note?: string;
  },
  context: any
) {
  if (!permissions.canManageProducts({ session: context.session })) {
    throw new Error("Access denied");
  }
  if (!variantId || !Number.isInteger(delta) || delta === 0) {
    throw new Error("A non-zero integer inventory delta is required");
  }
  if (!reason?.trim()) throw new Error("Inventory adjustment reason is required");

  await context.sudo().prisma.$transaction(async (tx: any) => {
    const variant = await tx.productVariant.findUnique({
      where: { id: variantId },
      select: { id: true, inventoryQuantity: true, allowBackorder: true },
    });
    if (!variant) throw new Error("Product variant not found");
    const adjusted = await tx.productVariant.updateMany({
      where: {
        id: variantId,
        ...(delta < 0 && !variant.allowBackorder
          ? { inventoryQuantity: { gte: Math.abs(delta) } }
          : {}),
      },
      data: { inventoryQuantity: { increment: delta } },
    });
    if (adjusted.count !== 1) {
      throw new Error("Inventory adjustment would make stock negative");
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
