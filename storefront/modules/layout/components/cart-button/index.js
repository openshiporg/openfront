import CartDropdown from "../cart-dropdown";
import { retrieveCart } from "@storefront/modules/cart/actions";

const fetchCart = async () => {
  const cart = await retrieveCart();

  if (!cart) {
    return null;
  }

  return cart;
};

export default async function CartButton() {
  const cart = await fetchCart();

  return <CartDropdown cart={cart} />;
}
