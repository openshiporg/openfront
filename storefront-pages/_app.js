// import { MEDUSA_BACKEND_URL, queryClient } from "@lib/storefront/config";
// import { AccountProvider } from "@lib/storefront/context/account-context";
// import { CartDropdownProvider } from "@lib/storefront/context/cart-dropdown-context";
// import { MobileMenuProvider } from "@lib/storefront/context/mobile-menu-context";
// import { StoreProvider } from "@lib/storefront/context/store-context";
// import { Hydrate } from "@tanstack/react-query";
// import { CartProvider, MedusaProvider } from "medusa-react";
import { KeystoneProvider } from "@keystone/keystoneProvider";
import "../styles/globals.css";
import { Core } from "@keystone-ui/core";

function App({ Component, pageProps }) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <Core>
      <KeystoneProvider>
        {/* <MedusaProvider
        baseUrl={MEDUSA_BACKEND_URL}
        queryClientProviderProps={{
          client: queryClient,
        }}
      >
        <Hydrate state={pageProps.dehydratedState}>
          <CartDropdownProvider>
            <MobileMenuProvider>
              <CartProvider>
                <StoreProvider>
                  <AccountProvider> */}
        {getLayout(<Component {...pageProps} />)}
        {/* </AccountProvider>
                </StoreProvider>
              </CartProvider>
            </MobileMenuProvider>
          </CartDropdownProvider>
        </Hydrate>
      </MedusaProvider> */}
      </KeystoneProvider>
    </Core>
  );
}

export default App;
