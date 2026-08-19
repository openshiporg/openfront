// Deprecated: invoice settlement is exclusively handled by the provider-backed,
// idempotent completeInvoicePayment mutation. This file remains as a tombstone
// for imports in downstream workspaces; it is not registered in the schema.
async function payInvoice() {
  throw new Error("payInvoice is deprecated; use completeInvoicePayment");
}

export default payInvoice;
