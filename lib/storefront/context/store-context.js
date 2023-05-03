import { medusaClient } from "@lib/storefront/config"
import { handleError } from "@lib/storefront/util/handle-error"
import {
  useCart,
  useCreateLineItem,
  useDeleteLineItem,
  useUpdateLineItem
} from "medusa-react"
import React, { useEffect, useState } from "react"
import { useCartDropdown } from "./cart-dropdown-context"

const StoreContext = React.createContext(null)

export const useStore = () => {
  const context = React.useContext(StoreContext)
  if (context === null) {
    throw new Error("useStore must be used within a StoreProvider")
  }
  return context
}

const IS_SERVER = typeof window === "undefined"
const CART_KEY = "medusa_cart_id"
const REGION_KEY = "medusa_region"

export const StoreProvider = ({ children }) => {
  const { cart, setCart, createCart, updateCart } = useCart()
  const [countryCode, setCountryCode] = useState(undefined)
  const { timedOpen } = useCartDropdown()
  const addLineItem = useCreateLineItem(cart?.id)
  const removeLineItem = useDeleteLineItem(cart?.id)
  const adjustLineItem = useUpdateLineItem(cart?.id)

  const storeRegion = (regionId, countryCode) => {
    if (!IS_SERVER) {
      localStorage.setItem(
        REGION_KEY,
        JSON.stringify({ regionId, countryCode })
      )

      setCountryCode(countryCode)
    }
  }

  useEffect(() => {
    if (!IS_SERVER) {
      const storedRegion = localStorage.getItem(REGION_KEY)
      if (storedRegion) {
        const { countryCode } = JSON.parse(storedRegion)
        setCountryCode(countryCode)
      }
    }
  }, [])

  const getRegion = () => {
    if (!IS_SERVER) {
      const region = localStorage.getItem(REGION_KEY)
      if (region) {
        return JSON.parse(region)
      }
    }
    return null
  }

  const setRegion = async (regionId, countryCode) => {
    await updateCart.mutateAsync(
      {
        region_id: regionId
      },
      {
        onSuccess: ({ cart }) => {
          setCart(cart)
          storeCart(cart.id)
          storeRegion(regionId, countryCode)
        },
        onError: error => {
          if (process.env.NODE_ENV === "development") {
            console.error(error)
          }
        }
      }
    )
  }

  const ensureRegion = (region, countryCode) => {
    if (!IS_SERVER) {
      const { regionId, countryCode: defaultCountryCode } = getRegion() || {
        regionId: region.id,
        countryCode: region.countries[0].iso_2
      }

      const finalCountryCode = countryCode || defaultCountryCode

      if (regionId !== region.id) {
        setRegion(region.id, finalCountryCode)
      }

      storeRegion(region.id, finalCountryCode)
      setCountryCode(finalCountryCode)
    }
  }

  const storeCart = id => {
    if (!IS_SERVER) {
      localStorage.setItem(CART_KEY, id)
    }
  }

  const getCart = () => {
    if (!IS_SERVER) {
      return localStorage.getItem(CART_KEY)
    }
    return null
  }

  const deleteCart = () => {
    if (!IS_SERVER) {
      localStorage.removeItem(CART_KEY)
    }
  }

  const deleteRegion = () => {
    if (!IS_SERVER) {
      localStorage.removeItem(REGION_KEY)
    }
  }

  const createNewCart = async regionId => {
    await createCart.mutateAsync(
      { region_id: regionId },
      {
        onSuccess: ({ cart }) => {
          setCart(cart)
          storeCart(cart.id)
          ensureRegion(cart.region, cart.shipping_address?.country_code)
        },
        onError: error => {
          if (process.env.NODE_ENV === "development") {
            console.error(error)
          }
        }
      }
    )
  }

  const resetCart = () => {
    deleteCart()

    const savedRegion = getRegion()

    createCart.mutate(
      {
        region_id: savedRegion?.regionId
      },
      {
        onSuccess: ({ cart }) => {
          setCart(cart)
          storeCart(cart.id)
          ensureRegion(cart.region, cart.shipping_address?.country_code)
        },
        onError: error => {
          if (process.env.NODE_ENV === "development") {
            console.error(error)
          }
        }
      }
    )
  }

  useEffect(() => {
    const ensureCart = async () => {
      const cartId = getCart()
      const region = getRegion()

      if (cartId) {
        const cartRes = await medusaClient.carts
          .retrieve(cartId)
          .then(({ cart }) => {
            return cart
          })
          .catch(async _ => {
            return null
          })

        if (!cartRes || cartRes.completed_at) {
          deleteCart()
          deleteRegion()
          await createNewCart()
          return
        }

        setCart(cartRes)
        ensureRegion(cartRes.region)
      } else {
        await createNewCart(region?.regionId)
      }
    }

    if (!IS_SERVER && !cart?.id) {
      ensureCart()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addItem = ({ variantId, quantity }) => {
    addLineItem.mutate(
      {
        variant_id: variantId,
        quantity: quantity
      },
      {
        onSuccess: ({ cart }) => {
          setCart(cart)
          storeCart(cart.id)
          timedOpen()
        },
        onError: error => {
          handleError(error)
        }
      }
    )
  }

  const deleteItem = lineId => {
    removeLineItem.mutate(
      {
        lineId
      },
      {
        onSuccess: ({ cart }) => {
          setCart(cart)
          storeCart(cart.id)
        },
        onError: error => {
          handleError(error)
        }
      }
    )
  }

  const updateItem = ({ lineId, quantity }) => {
    adjustLineItem.mutate(
      {
        lineId,
        quantity
      },
      {
        onSuccess: ({ cart }) => {
          setCart(cart)
          storeCart(cart.id)
        },
        onError: error => {
          handleError(error)
        }
      }
    )
  }

  return (
    <StoreContext.Provider
      value={{
        countryCode,
        setRegion,
        addItem,
        deleteItem,
        updateItem,
        resetCart
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}
