"use client";
import { medusaClient } from "@lib/config"
import { useMutation } from "@tanstack/react-query"
import { useMeCustomer } from "medusa-react"
import { useRouter } from "next/navigation"
import React, { createContext, useCallback, useContext, useState } from "react"

export let LOGIN_VIEW;

(function(LOGIN_VIEW) {
  LOGIN_VIEW["SIGN_IN"] = "sign-in";
  LOGIN_VIEW["REGISTER"] = "register";
})(LOGIN_VIEW || (LOGIN_VIEW = {}));

const AccountContext = createContext(null)

const handleDeleteSession = () => {
  return medusaClient.auth.deleteSession();
}

export const AccountProvider = ({
  children
}) => {
  const {
    customer,
    isLoading: retrievingCustomer,
    refetch,
    remove,
  } = useMeCustomer({ onError: () => {} })

  const loginView = useState(LOGIN_VIEW.SIGN_IN)

  const router = useRouter()

  const checkSession = useCallback(() => {
    if (!customer && !retrievingCustomer) {
      router.push("/account/login")
    }
  }, [customer, retrievingCustomer, router])

  const useDeleteSession = useMutation({
    mutationFn: handleDeleteSession,
    mutationKey: ["delete-session"],
  })

  const handleLogout = () => {
    useDeleteSession.mutate(undefined, {
      onSuccess: () => {
        remove()
        loginView[1](LOGIN_VIEW.SIGN_IN)
        router.push("/")
      },
    })
  }

  return (
    <AccountContext.Provider
      value={{
        customer,
        retrievingCustomer,
        loginView,
        checkSession,
        refetchCustomer: refetch,
        handleLogout,
      }}>
      {children}
    </AccountContext.Provider>
  );
}

export const useAccount = () => {
  const context = useContext(AccountContext)

  if (context === null) {
    throw new Error("useAccount must be used within a AccountProvider")
  }
  return context
}
