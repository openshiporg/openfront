import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import Divider from "@storefront/modules/common/components/divider"

const CartTemplate = ({ cart, user }) => {

  return (
    <div className="py-12">
      {cart?.lineItems.length ? (
        <>
          <div className="grid grid-cols-1 small:grid-cols-[1fr_360px] gap-x-40">
            <div className="flex flex-col bg-white py-6 gap-y-6">
              {!user && (
                <>
                  <SignInPrompt />
                  <Divider />
                </>
              )}
              <ItemsTemplate region={cart?.region} items={cart?.lineItems} />
            </div>
            <div className="relative">
              <div className="flex flex-col gap-y-8 sticky top-12">
                {cart && cart.region && (
                  <>
                    <div className="bg-white py-6">
                      <Summary cart={cart} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <EmptyCartMessage />
      )}
    </div>
  )
}

export default CartTemplate

