import useToggleState from "@storefront/hooks/use-toggle-state";
import { createContext, useContext, useEffect, useState } from "react";

export const CartDropdownContext = createContext(null);

export const CartDropdownProvider = ({ children }) => {
  const { state, close, open } = useToggleState();
  const [activeTimer, setActiveTimer] = useState(undefined);

  const timedOpen = () => {
    open();

    const timer = setTimeout(close, 5000);

    setActiveTimer(timer);
  };

  const openAndCancel = () => {
    if (activeTimer) {
      clearTimeout(activeTimer);
    }

    open();
  };

  // Clean up the timer when the component unmounts
  useEffect(() => {
    return () => {
      if (activeTimer) {
        clearTimeout(activeTimer);
      }
    };
  }, [activeTimer]);

  return (
    <CartDropdownContext.Provider
      value={{ state, close, open: openAndCancel, timedOpen }}
    >
      {children}
    </CartDropdownContext.Provider>
  );
};

export const useCartDropdown = () => {
  const context = useContext(CartDropdownContext);

  if (context === null) {
    throw new Error(
      "useCartDropdown must be used within a CartDropdownProvider"
    );
  }

  return context;
};
