"use client";

import { UIProviders } from "@keystone/uiProviders";
import { KeystoneProvider } from "@keystone/keystoneProviderNoUI";
import { DrawerProvider } from "@keystone/components/Modals";

export default function RootLayout({ children }) {
  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const UIProvider = UIProviders[appTheme];

  return (
    <html lang="en">
      <body>
        <UIProvider>
          <KeystoneProvider>
            <DrawerProvider>{children}</DrawerProvider>
          </KeystoneProvider>
        </UIProvider>
      </body>
    </html>
  );
}
