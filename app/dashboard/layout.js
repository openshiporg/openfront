"use client";

import { Core } from "@keystone-ui/core";
import { DrawerProvider } from "@keystone/components/Modals";
import { ToastProvider } from "@keystone/components/Toast";
import { KeystoneProvider } from "@keystone/keystoneProviderNoUI";
import { UIProviders } from "@keystone/uiProviders";
import { useAdminPathHandler } from "@keystone/utils/useAdminPathHandler";
import { useAuthRedirect } from "@keystone/utils/useAuthRedirect";

export default function RootLayout({ children }) {
  // useAuthRedirect();
  useAdminPathHandler();

  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const UIProvider = UIProviders[appTheme];

  return (
    <html lang="en">
      <body>
        <UIProvider>
          <KeystoneProvider>
            <ToastProvider>
              <DrawerProvider>{children}</DrawerProvider>
            </ToastProvider>
          </KeystoneProvider>
        </UIProvider>
      </body>
    </html>
  );
}
