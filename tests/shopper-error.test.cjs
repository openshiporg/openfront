// Shopper-facing cart validation is a GraphQLError with a stable code (not masked as "Unexpected error."). Offline.
require('tsx/cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { GraphQLError } = require('graphql');
const { shopperError } = require('../features/keystone/lib/shopperError.ts');
const updateActiveCart = require('../features/keystone/mutations/updateActiveCart.ts').default;
const updateActiveCartLineItem = require('../features/keystone/mutations/updateActiveCartLineItem.ts').default;
const { assertCartAccess, assertLineItemBelongsToCart } = require('../features/keystone/security/cart-access.ts');

const is = (message, code) => (e) => e instanceof GraphQLError && e.message === message && e.extensions.code === code;

function context({ cart, lineItems = [], lineItemCart = 'c1', fail } = {}) {
  const row = cart === undefined ? { id: 'c1', user: { id: 'owner' }, order: null } : cart;
  const ctx = { session: { itemId: 'owner', listKey: 'User', data: { isActive: true, role: null } }, req: { headers: {} } };
  ctx.sudo = () => ({
    query: {
      Cart: { findOne: async (a) => { if (fail) throw fail; return a.query.includes('lineItems') ? { id: 'c1', lineItems } : row; } },
      LineItem: { findOne: async () => ({ id: 'l1', cart: { id: lineItemCart } }) },
    },
    prisma: {},
  });
  return ctx;
}
const update = (data, ctx) => updateActiveCart(null, { cartId: 'c1', data }, ctx);

test('region change after items are added is CART_REGION_LOCKED', async () => {
  await assert.rejects(update({ region: { connect: { id: 'r2' } } }, context({ lineItems: [{ id: 'l1', quantity: 1, productVariant: { id: 'v' } }] })),
    is('Region cannot change after items are added; start a new cart', 'CART_REGION_LOCKED'));
});

test('quantity validation is INVALID_QUANTITY', async () => {
  await assert.rejects(update({ lineItems: { update: [{ where: { id: 'l1' }, data: { quantity: 0 } }] } }, context()),
    is('Line item quantity must be a positive integer', 'INVALID_QUANTITY'));
  await assert.rejects(updateActiveCartLineItem(null, { cartId: 'c1', lineId: 'l1', quantity: -1 }, context()),
    is('Quantity must be a positive integer', 'INVALID_QUANTITY'));
});

test('address relation without an id is ADDRESS_REQUIRED', async () => {
  await assert.rejects(update({ shippingAddress: { connect: {} } }, context()), is('Address ID is required', 'ADDRESS_REQUIRED'));
});

test('a line item from another cart is LINE_ITEM_NOT_FOUND', async () => {
  await assert.rejects(assertLineItemBelongsToCart(context({ lineItemCart: 'other' }), 'c1', 'l1'), is('Line item not found', 'LINE_ITEM_NOT_FOUND'));
});

test('a completed cart is CART_COMPLETED', async () => {
  await assert.rejects(assertCartAccess(context({ cart: { id: 'c1', user: { id: 'owner' }, order: { id: 'o1' } } }), 'c1'), is('Cart has already been completed', 'CART_COMPLETED'));
});

test('a foreign cart is still the plain "Cart not found" access refusal (unchanged)', async () => {
  const ctx = context({ cart: { id: 'c1', user: { id: 'someone-else' }, order: null } });
  await assert.rejects(assertCartAccess(ctx, 'c1'), (e) => !(e instanceof GraphQLError) && e.message === 'Cart not found');
});

test('internal errors stay plain Errors (masked)', async () => {
  await assert.rejects(update({ email: 'a@b.co' }, context({ fail: new Error('db down') })), (e) => !(e instanceof GraphQLError) && e.message === 'db down');
});

test('shopperError carries the code', () => {
  assert.equal(shopperError('x', 'Y').extensions.code, 'Y');
});
