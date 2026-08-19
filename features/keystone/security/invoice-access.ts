import { permissions } from "../access";

export async function assertInvoiceAccess(context: any, invoiceId: string) {
  if (!context.session?.itemId) throw new Error("Invoice not found");
  const invoice = await context.sudo().query.Invoice.findOne({
    where: { id: invoiceId },
    query: "id status account { user { id } } user { id }",
  });
  if (!invoice) throw new Error("Invoice not found");

  const canManage =
    permissions.canManagePayments({ session: context.session }) ||
    permissions.canManageOrders({ session: context.session });
  const ownerId = invoice.account?.user?.id || invoice.user?.id;
  if (!canManage && ownerId !== context.session.itemId) {
    throw new Error("Invoice not found");
  }
  return invoice;
}
