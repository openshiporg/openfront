"use client";

import { DrawerProvider } from "@keystone/components/Modals";
import { ToastProvider } from "@keystone/components/Toast";
import { UIProvider } from "@keystone/components/UIProvider";
import { KeystoneProvider } from "@keystone/keystoneProviderNoUI";
import { useAdminPathHandler } from "@keystone/utils/useAdminPathHandler";
import { useAuthRedirect } from "@keystone/utils/useAuthRedirect";

export default function RootLayout({ children }) {
  useAuthRedirect();
  useAdminPathHandler();

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
