"use client";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import LinkStatus from "@/features/storefront/modules/common/components/link-status"
import LineItemOptions from "@/features/storefront/modules/common/components/line-item-options"
import LineItemPrice from "@/features/storefront/modules/common/components/line-item-price"
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import Thumbnail from "@/features/storefront/modules/products/components/thumbnail"
import { Button } from "@/components/ui/button";
import { deleteLineItem } from "@/features/storefront/lib/data/cart";

interface CartItem {
  id: string
  quantity: number
  created_at: string
  thumbnail: string
  title: string
  variantTitle?: string
  percentageOff: number
  originalPrice: string | number
  total: string | number
  productVariant: {
    title?: string
    sku?: string
    product: {
      handle: string
    }
  }
}

interface CartState {
  lineItems: CartItem[]
  subtotal: string
}

const CartDropdown = ({
  cart: cartState,
}: {
  cart: CartState
}) => {
  const [activeTimer, setActiveTimer] = useState<NodeJS.Timeout | undefined>(undefined)
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)

  const open = () => {
    setCartDropdownOpen(true);
    itemRef.current = totalItems;
  }
  
  const close = () => setCartDropdownOpen(false)

  const totalItems =
    cartState?.lineItems?.reduce((acc: number, item: CartItem) => {
      return acc + item.quantity
    }, 0) || 0

  const itemRef = useRef(totalItems || 0)

  const timedOpen = () => {
    open()
    const timer = setTimeout(close, 5000)
    setActiveTimer(timer)
  }

  const openAndCancel = () => {
    if (activeTimer) {
      clearTimeout(activeTimer)
    }
    open()
  }

  useEffect(() => {
    return () => {
      if (activeTimer) {
        clearTimeout(activeTimer)
      }
    }
  }, [activeTimer])

  const pathname = usePathname()

  useEffect(() => {
    if (itemRef.current !== totalItems && !(pathname ?? "").includes("/cart")) {
      timedOpen()
    }
  }, [totalItems, pathname])

  return (
    // TODO: Remove suppressHydrationWarning when React 19.2.0 useId bug is fixed upstream
    // Known issue: https://github.com/radix-ui/primitives/issues/3700
    // Radix UI generates different IDs on server vs client in React 19.2.0 (Next.js 16+)
    <div className="h-full z-50" suppressHydrationWarning>
      <Popover open={cartDropdownOpen} onOpenChange={setCartDropdownOpen}>
        <div className="relative h-full" onMouseEnter={openAndCancel} onMouseLeave={close}>
          <PopoverTrigger asChild>
            <button className="h-full" suppressHydrationWarning>
              <LocalizedClientLink className="flex items-center hover:text-foreground" href="/cart">
                {`Cart`}
                {totalItems > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center rounded-full bg-muted text-foreground/60 border text-[.5rem] font-bold h-4 w-4">
                    {totalItems}
                  </span>
                )}
              </LocalizedClientLink>
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="hidden sm:block absolute top-[calc(100%+1px)] right-0 bg-background border-x border-b w-[420px] text-foreground p-0"
            sideOffset={4}
            align="end"
            onMouseEnter={openAndCancel}
            onMouseLeave={close}
          >
            {/* <div className="p-4 flex items-center justify-center border-b">
              <h3 className="text-lg font-medium">Cart</h3>
            </div> */}
            {cartState && cartState.lineItems?.length ? (
              <>
                <div className="overflow-y-scroll max-h-[402px] px-4 py-6 grid grid-cols-1 gap-y-6 no-scrollbar">
                  {cartState.lineItems
                    .sort((a: CartItem, b: CartItem) => {
                      return a.created_at > b.created_at ? -1 : 1
                    })
                    .map((item: CartItem) => (
                      <div className="grid grid-cols-[122px_1fr] gap-x-4" key={item.id}>
                        <LocalizedClientLink href={`/products/${item.productVariant.product.handle}`} className="w-28">
                          <Thumbnail thumbnail={item.thumbnail} size="square" />
                        </LocalizedClientLink>
                        <div className="flex flex-col">
                          <div className="flex flex-col flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex flex-col overflow-ellipsis whitespace-nowrap mr-4">
                                <h3 className="text-sm overflow-hidden text-ellipsis">
                                  <LocalizedClientLink href={`/products/${item.productVariant.product.handle}`}>
                                    {item.title}
                                  </LocalizedClientLink>
                                </h3>
                                {item.productVariant.title && <p className="text-muted-foreground text-xs">{item.productVariant.title}</p>}
                                <LineItemOptions variant={item.productVariant} variantTitle={item.variantTitle}/>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Quantity: {item.quantity}
                                  </span>
                                  <span className="text-muted-foreground">·</span>
                                  <DeleteButton id={item.id} />
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <LineItemPrice item={item} />
                              </div>
                            </div>
                          </div>
                          {/* <div><Button size="icon"><Trash2 /></Button></div> */}
                        </div>
                      </div>
                    ))}
                </div>
                <div className="p-4 flex flex-col gap-y-4 border-t mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground font-semibold">
                      Subtotal{" "}
                      <span className="font-normal text-muted-foreground">(excl. taxes)</span>
                    </span>
                    <span className="text-lg">
                      {cartState.subtotal}
                    </span>
                  </div>
                  <LocalizedClientLink href="/cart" passHref>
                    <Button className="w-full" size="lg">
                      <LinkStatus />
                      Go to cart
                    </Button>
                  </LocalizedClientLink>
                </div>
              </>
            ) : (
              <div className="flex py-16 flex-col gap-y-4 items-center justify-center">
                <div className="border text-sm bg-muted/40 flex items-center justify-center w-6 h-6 rounded-full text-white">
                  <span>0</span>
                </div>
                <span className="text-muted-foreground/80">Your shopping bag is empty.</span>
                <div>
                  <LocalizedClientLink href="/store">
                    <>
                      <span className="sr-only">Go to all products page</span>
                      <Button onClick={close}>Explore products</Button>
                    </>
                  </LocalizedClientLink>
                </div>
              </div>
            )}
          </PopoverContent>
        </div>
      </Popover>
    </div>
  );
}

const DeleteButton = ({
  id,
}: {
  id: string;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    await deleteLineItem(id).catch(() => {
      setIsDeleting(false);
    });
  };

  return (
    <button
      onClick={() => handleDelete(id)}
      className="cursor-pointer text-xs font-medium uppercase tracking-wide text-rose-700/70 hover:text-rose-600"
      disabled={isDeleting}
    >
      {isDeleting ? "Removing..." : "Remove"}
    </button>
  );
};

export default CartDropdown
