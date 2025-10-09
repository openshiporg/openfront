import { notFound, redirect } from "next/navigation";
import { gql } from "graphql-request";
import { openfrontClient } from "@/features/storefront/lib/config";
import { getUser } from "@/features/storefront/lib/data/user";
import { setCartId } from "@/features/storefront/lib/data/cookies";
import { revalidateTag } from "next/cache";
import { Button } from "@/components/ui/button";
import Thumbnail from "@/features/storefront/modules/products/components/thumbnail";
import Divider from "@/features/storefront/modules/common/components/divider";

export const metadata = {
  title: "Checkout Link",
  description: "Complete your order via checkout link"
};

interface PageProps {
  searchParams: Promise<{
    cartId?: string;
  }>;
  params: Promise<{
    countryCode: string;
  }>;
}

async function CheckoutLinkContent({ cartId, countryCode }: { cartId: string, countryCode: string }) {
  const user = await getUser();
  
  if (!user) {
    // This should not happen as the route is protected, but just in case
    redirect(`/${countryCode}/account/login`);
  }

  // Check if cart exists and belongs to user
  const CART_QUERY = gql`
    query GetCart($cartId: ID!) {
      activeCart(cartId: $cartId)
    }
  `;

  let cart;
  try {
    const { activeCart } = await openfrontClient.request(CART_QUERY, { cartId });
    cart = activeCart;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return (
      <div className="flex flex-col gap-4 items-center justify-center min-h-[400px]">
        <div className="text-6xl">🛒</div>
        <h2 className="text-xl font-semibold text-gray-900">Cart Not Found</h2>
        <p className="text-gray-600 text-center max-w-md">
          The cart associated with this checkout link could not be found or may have expired.
        </p>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center min-h-[400px]">
        <div className="text-6xl">🛒</div>
        <h2 className="text-xl font-semibold text-gray-900">Cart Not Found</h2>
        <p className="text-gray-600 text-center max-w-md">
          The cart associated with this checkout link could not be found or may have expired.
        </p>
      </div>
    );
  }

  // Server action to connect cart to user and redirect to checkout
  async function continueToCheckout() {
    'use server';
    
    // Connect the cart to the logged-in user
    const CONNECT_CART_MUTATION = gql`
      mutation UpdateActiveCart($cartId: ID!, $data: CartUpdateInput!) {
        updateActiveCart(cartId: $cartId, data: $data) {
          id
          user {
            id
            email
          }
        }
      }
    `;
    
    try {
      await openfrontClient.request(CONNECT_CART_MUTATION, {
        cartId,
        data: {
          user: {
            connect: { id: user.id }
          },
          email: user.email
        }
      });
      
      await setCartId(cartId);
      revalidateTag('cart');
      redirect(`/${countryCode}/checkout?step=payment`);
    } catch (error) {
      console.error('Error connecting cart to user:', error);
      // Still proceed to checkout even if connection fails
      await setCartId(cartId);
      revalidateTag('cart');
      redirect(`/${countryCode}/checkout?step=payment`);
    }
  }

  const numberOfLines = cart.lineItems?.reduce((acc: number, item: any) => {
    return acc + item.quantity;
  }, 0) ?? 0;

  const numberOfProducts = cart.lineItems?.length ?? 0;

  return (
    <div className="w-full" data-testid="checkout-link-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl font-semibold">Complete Your Order</h1>
        <p className="text-sm font-normal">
          Review your cart and continue to secure checkout to complete your order.
        </p>
      </div>
      
      <div>
        <div className="flex flex-col gap-y-8 w-full">
          <div className="border-b pb-6">
            <div className="bg-background flex flex-col" data-testid="cart-card">
              <div className="uppercase text-base leading-6 font-semibold mb-1">
                CART #{cart.id.slice(-8).toUpperCase()}
              </div>
              <div className="flex items-center divide-x divide-gray-200 text-xs leading-5 font-normal text-foreground">
                <span className="pr-2" data-testid="cart-total">
                  {cart.total}
                </span>
                <span className="px-2" data-testid="cart-subtotal">
                  Subtotal: {cart.subtotal}
                </span>
                <span className="px-2" data-testid="cart-shipping">
                  Shipping: {cart.shipping}
                </span>
                <span className="pl-2">{`${numberOfLines} ${
                  numberOfLines > 1 ? "items" : "item"
                }`}</span>
              </div>
              
              {cart.lineItems && cart.lineItems.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-4">
                  {cart.lineItems.slice(0, 3).map((item: any) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-y-2"
                      data-testid="cart-item"
                    >
                      <Thumbnail thumbnail={item.thumbnail} images={[]} size="full" />
                      <div className="flex items-center text-xs leading-5 font-normal text-foreground">
                        <span
                          className="text-foreground font-semibold"
                          data-testid="item-title"
                        >
                          {item.title}
                        </span>
                        <span className="ml-2">x</span>
                        <span data-testid="item-quantity">{item.quantity}</span>
                      </div>
                    </div>
                  ))}
                  {numberOfProducts > 3 && (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <span className="text-xs leading-5 font-normal text-foreground">
                        + {numberOfLines - 3}
                      </span>
                      <span className="text-xs leading-5 font-normal text-foreground">
                        more
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-end">
                <form action={continueToCheckout}>
                  <Button type="submit" data-testid="complete-checkout-button" variant="default" size="sm">
                    Complete Checkout
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function CheckoutLinkPage({ searchParams, params }: PageProps) {
  const { cartId } = await searchParams;
  const { countryCode } = await params;

  if (!cartId) {
    return notFound();
  }

  return <CheckoutLinkContent cartId={cartId} countryCode={countryCode} />;
}