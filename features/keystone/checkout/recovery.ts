import { getOrCreateIdempotencyAttempt } from "../utils/idempotency";

type CartInventoryLine = {
  quantity: number;
  productVariant: {
    id: string;
    title?: string;
    inventoryQuantity: number;
    manageInventory: boolean;
    allowBackorder: boolean;
  };
};

export function checkoutKey(cartId: string): string {
  return `checkout:${cartId}`;
}

export async function getOrCreateCheckoutAttempt(
  prisma: any,
  cartId: string,
  paymentSessionId?: string
): Promise<any> {
  const idempotencyKey = checkoutKey(cartId);
  const { attempt, replay } = await getOrCreateIdempotencyAttempt(prisma, {
    key: idempotencyKey,
    requestPath: "completeActiveCart",
    requestParams: { cartId, paymentSessionId: paymentSessionId || null },
  });
  if (attempt.recoveryPoint === "completed") return attempt;
  if (!replay) return attempt;

  const acquired = await prisma.idempotencyKey.updateMany({
    where: {
      id: attempt.id,
      OR: [
        { lockedAt: null },
        { lockedAt: { lt: new Date(Date.now() - 5 * 60 * 1000) } },
      ],
    },
    data: { lockedAt: new Date() },
  });
  if (acquired.count !== 1) throw new Error("Checkout is already in progress");
  return prisma.idempotencyKey.findUnique({ where: { id: attempt.id } });
}

export async function updateCheckoutAttempt(
  prisma: any,
  id: string,
  recoveryPoint: string,
  responseBody?: Record<string, unknown>,
  responseCode?: number
): Promise<void> {
  await prisma.idempotencyKey.update({
    where: { id },
    data: {
      recoveryPoint,
      responseBody,
      responseCode,
      lockedAt: ["completed", "failed", "started"].includes(recoveryPoint) ? null : new Date(),
    },
  });
}

function aggregateLines(lines: CartInventoryLine[]) {
  const byVariant = new Map<string, { quantity: number; variant: CartInventoryLine["productVariant"] }>();
  for (const line of lines || []) {
    if (!line.productVariant?.id || !Number.isInteger(line.quantity) || line.quantity <= 0) {
      throw new Error("Cart contains an invalid inventory line");
    }
    const current = byVariant.get(line.productVariant.id);
    byVariant.set(line.productVariant.id, {
      variant: line.productVariant,
      quantity: (current?.quantity || 0) + line.quantity,
    });
  }
  return [...byVariant.values()];
}

export async function reserveCartInventory(
  prisma: any,
  lines: CartInventoryLine[],
  idempotencyKey: string,
  checkoutAttemptId?: string
): Promise<void> {
  const reservations = aggregateLines(lines);
  await prisma.$transaction(async (tx: any) => {
    for (const { variant, quantity } of reservations) {
      if (!variant.manageInventory) continue;

      const result = await tx.productVariant.updateMany({
        where: {
          id: variant.id,
          ...(variant.allowBackorder
            ? {}
            : { inventoryQuantity: { gte: quantity } }),
        },
        data: { inventoryQuantity: { decrement: quantity } },
      });
      if (result.count !== 1) {
        throw new Error(`Insufficient stock for ${variant.title || variant.id}`);
      }

      await tx.stockMovement.create({
        data: {
          type: "REMOVE",
          quantity,
          reason: "checkout_reservation",
          note: idempotencyKey,
          variantId: variant.id,
        },
      });
    }
    if (checkoutAttemptId) {
      await tx.idempotencyKey.update({
        where: { id: checkoutAttemptId },
        data: { recoveryPoint: "stock_reserved", lockedAt: new Date() },
      });
    }
  });
}

export async function reserveDiscountUsage(
  prisma: any,
  discounts: Array<{ id: string; code?: string }>,
  checkoutAttemptId?: string
): Promise<void> {
  await prisma.$transaction(async (tx: any) => {
    for (const discount of discounts) {
      const current = await tx.discount.findUnique({
        where: { id: discount.id },
        select: {
          usageCount: true,
          usageLimit: true,
          isDisabled: true,
          startsAt: true,
          endsAt: true,
        },
      });
      if (!current) throw new Error("Discount not found");
      const now = new Date();
      if (
        current.isDisabled ||
        current.startsAt > now ||
        (current.endsAt && current.endsAt <= now)
      ) {
        throw new Error(`Discount ${discount.code || discount.id} is no longer active`);
      }
      if (current.usageLimit !== null && current.usageCount >= current.usageLimit) {
        throw new Error(`Discount ${discount.code || discount.id} has reached its usage limit`);
      }
      const result = await tx.discount.updateMany({
        where: {
          id: discount.id,
          usageCount: current.usageCount,
          isDisabled: false,
          startsAt: { lte: now },
          OR: [{ endsAt: null }, { endsAt: { gt: now } }],
        },
        data: { usageCount: { increment: 1 } },
      });
      if (result.count !== 1) throw new Error("Discount usage changed; retry checkout");
    }
    if (checkoutAttemptId) {
      await tx.idempotencyKey.update({
        where: { id: checkoutAttemptId },
        data: { recoveryPoint: "resources_reserved", lockedAt: new Date() },
      });
    }
  });
}

export async function releaseDiscountUsage(
  prisma: any,
  discounts: Array<{ id: string }>
): Promise<void> {
  if (!discounts?.length) return;
  await prisma.$transaction(
    discounts.map((discount) =>
      prisma.discount.updateMany({
        where: { id: discount.id, usageCount: { gt: 0 } },
        data: { usageCount: { decrement: 1 } },
      })
    )
  );
}

export async function releaseCheckoutResources(
  prisma: any,
  lines: CartInventoryLine[],
  discounts: Array<{ id: string }>,
  idempotencyKey: string,
  checkoutAttemptId: string,
  errorMessage: string
): Promise<void> {
  const reservations = aggregateLines(lines);
  await prisma.$transaction(async (tx: any) => {
    for (const discount of discounts || []) {
      await tx.discount.updateMany({
        where: { id: discount.id, usageCount: { gt: 0 } },
        data: { usageCount: { decrement: 1 } },
      });
    }
    for (const { variant, quantity } of reservations) {
      if (!variant.manageInventory) continue;
      await tx.productVariant.update({
        where: { id: variant.id },
        data: { inventoryQuantity: { increment: quantity } },
      });
      await tx.stockMovement.create({
        data: {
          type: "RECEIVE",
          quantity,
          reason: "checkout_release",
          note: idempotencyKey,
          variantId: variant.id,
        },
      });
    }
    await tx.idempotencyKey.update({
      where: { id: checkoutAttemptId },
      data: {
        recoveryPoint: "started",
        responseBody: { error: errorMessage },
        responseCode: 409,
        lockedAt: null,
      },
    });
  });
}

export async function releaseCartInventory(
  prisma: any,
  lines: CartInventoryLine[],
  idempotencyKey: string
): Promise<void> {
  const reservations = aggregateLines(lines);
  await prisma.$transaction(async (tx: any) => {
    for (const { variant, quantity } of reservations) {
      if (!variant.manageInventory) continue;
      await tx.productVariant.update({
        where: { id: variant.id },
        data: { inventoryQuantity: { increment: quantity } },
      });
      await tx.stockMovement.create({
        data: {
          type: "RECEIVE",
          quantity,
          reason: "checkout_release",
          note: idempotencyKey,
          variantId: variant.id,
        },
      });
    }
  });
}
