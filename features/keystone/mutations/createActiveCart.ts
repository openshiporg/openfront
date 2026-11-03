import { shopperError } from "../lib/shopperError";
import { createCartProof } from "../security/token-crypto";

async function createActiveCart(
  _root: unknown,
  { regionId }: { regionId: string },
  context: any,
) {
  if (!regionId) throw shopperError("Region ID is required", "REGION_REQUIRED");

  const region = await context.query.Region.findOne({
    where: { id: regionId },
    query: "id",
  });
  if (!region) throw shopperError("Region not found", "REGION_NOT_FOUND");

  const cart = await context.sudo().query.Cart.createOne({
    data: {
      type: "default",
      region: { connect: { id: region.id } },
      ...(context.session?.itemId
        ? { user: { connect: { id: context.session.itemId } } }
        : {}),
    },
    query: "id region { id }",
  });

  return {
    ...cart,
    proof: createCartProof(cart.id),
  };
}

export default createActiveCart;
