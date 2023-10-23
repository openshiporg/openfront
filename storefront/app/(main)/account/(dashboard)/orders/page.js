import OrdersTemplate from "@modules/account/templates/orders-template"

export const metadata = {
  title: "Orders",
  description: "Overview of your previous orders..",
}

export default function Orders() {
  return <OrdersTemplate />;
}
