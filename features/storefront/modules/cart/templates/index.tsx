import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import Divider from "@/features/storefront/modules/common/components/divider"

interface CartTemplateProps {
  cart?: {
    id: string;
    lineItems: any[];
    region: any;
  };
  user: any;
}

const CartTemplate = ({ cart, user }: CartTemplateProps) => {
  return (
    <div className="py-12">
      <div className="max-w-[1440px] w-full mx-auto px-6" data-testid="cart-container">
        {cart?.lineItems?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_360px] gap-x-40">
            <div className="flex flex-col bg-background py-6 gap-y-6">
              {!user && (
                <>
                  <SignInPrompt />
                  <Divider />
                </>
              )}
              <ItemsTemplate items={cart.lineItems} region={cart.region} />
            </div>
            <div className="relative">
              <div className="flex flex-col gap-y-8 sticky top-12">
                {cart && cart.region && (
                  <>
                    <div className="bg-background py-6">
                      <Summary cart={cart} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <EmptyCartMessage />
          </div>
        )}
      </div>
    </div>
  )
}

export default CartTemplate

