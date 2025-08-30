import { notFound, redirect } from "next/navigation";
import { gql } from "graphql-request";
import { openfrontClient } from "@/features/storefront/lib/config";
import { Button } from "@/components/ui/button";
import Thumbnail from "@/features/storefront/modules/products/components/thumbnail";
import Divider from "@/features/storefront/modules/common/components/divider";
import Link from "next/link";

export const metadata = {
  title: "Complete Your Order",
  description: "Sign in to complete your order via checkout link"
};

interface PageProps {
  searchParams: Promise<{
    cartId?: string;
  }>;
  params: Promise<{
    countryCode: string;
  }>;
}

async function GuestCheckoutLinkContent({ cartId, countryCode }: { cartId: string, countryCode: string }) {
  
  // Check if cart exists
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

  const numberOfLines = cart.lineItems?.reduce((acc: number, item: any) => {
    return acc + item.quantity;
  }, 0) ?? 0;

  const numberOfProducts = cart.lineItems?.length ?? 0;

  return (
    <div className="w-full" data-testid="guest-checkout-link-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl font-semibold">Complete Your Order</h1>
        <p className="text-sm font-normal">
          Sign in to your account to complete this order securely, or create a new account.
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
              
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/${countryCode}/account?view=register&returnUrl=${encodeURIComponent(`/${countryCode}/account/checkout-link?cartId=${cartId}`)}`}>
                    Create Account
                  </Link>
                </Button>
                <Button asChild variant="default" size="sm" data-testid="sign-in-to-complete-button">
                  <Link href={`/${countryCode}/account?view=login&returnUrl=${encodeURIComponent(`/${countryCode}/account/checkout-link?cartId=${cartId}`)}`}>
                    Sign In to Complete Order
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Divider className="my-16" />
      </div>
    </div>
  );
}

export default async function GuestCheckoutLinkPage({ searchParams, params }: PageProps) {
  const { cartId } = await searchParams;
  const { countryCode } = await params;

  if (!cartId) {
    return notFound();
  }

  return <GuestCheckoutLinkContent cartId={cartId} countryCode={countryCode} />;
}