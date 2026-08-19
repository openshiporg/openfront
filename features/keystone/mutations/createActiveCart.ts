import { createCartProof } from "../security/token-crypto";

async function createActiveCart(
  _root: unknown,
  { regionId }: { regionId: string },
  context: any,
) {
  if (!regionId) throw new Error("Region ID is required");

  const region = await context.query.Region.findOne({
    where: { id: regionId },
    query: "id",
  });
  if (!region) throw new Error("Region not found");

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
