import useCurrentWidth from "@lib/storefront/hooks/use-current-width"
import useDebounce from "@lib/storefront/hooks/use-debounce"
import useToggleState from "@lib/storefront/hooks/use-toggle-state"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react"

export const MobileMenuContext = createContext(null)

export const MobileMenuProvider = ({ children }) => {
  const { state, close, open, toggle } = useToggleState()
  const [screen, setScreen] = useState("main")

  const windowWidth = useCurrentWidth()

  const debouncedWith = useDebounce(windowWidth, 200)

  const closeMenu = useCallback(() => {
    close()

    setTimeout(() => {
      setScreen("main")
    }, 500)
  }, [close])

  useEffect(() => {
    if (state && debouncedWith >= 1024) {
      closeMenu()
    }
  }, [debouncedWith, state, closeMenu])

  useEffect(() => {}, [debouncedWith])

  return (
    <MobileMenuContext.Provider
      value={{
        state,
        close: closeMenu,
        open,
        toggle,
        screen: [screen, setScreen]
      }}
    >
      {children}
    </MobileMenuContext.Provider>
  )
}

export const useMobileMenu = () => {
  const context = useContext(MobileMenuContext)

  if (context === null) {
    throw new Error(
      "useCartDropdown must be used within a CartDropdownProvider"
    )
  }

  return context
}
