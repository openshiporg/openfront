import { redirect } from 'next/navigation';

// Stock is kept on each product variant (Inventory quantity), so Inventory opens Products.
export default function InventoryPage() {
  redirect('/dashboard/platform/products');
}
