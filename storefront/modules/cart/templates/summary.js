import Button from "@modules/common/components/button"
import CartTotals from "@modules/common/components/cart-totals"
import Link from "next/link"

const Summary = ({
  cart
}) => {
  return (
    <div className="grid grid-cols-1 gap-y-6">
      <CartTotals cart={cart} />
      <Link href="/checkout">
        <Button>Go to checkout</Button>
      </Link>
    </div>
  );
}

export default Summary