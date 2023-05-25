import { Core } from "@keystone-ui/core";
import { ToastProvider } from "@keystone-ui/toast";
// import { DrawerProvider } from "@keystone-ui/modals";

export const KeystoneUI = ({ children }) => {
  return (
    <Core>
      <ToastProvider>
        {children}
      </ToastProvider>
    </Core>
  );
};
