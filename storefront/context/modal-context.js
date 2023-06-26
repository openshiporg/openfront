import React, { createContext, useContext } from "react"

const ModalContext = createContext(null)

export const ModalProvider = ({ children, close }) => {
  return (
    <ModalContext.Provider
      value={{
        close
      }}
    >
      {children}
    </ModalContext.Provider>
  )
}

export const useModal = () => {
  const context = useContext(ModalContext)
  if (context === null) {
    throw new Error("useModal must be used within a ModalProvider")
  }
  return context
}