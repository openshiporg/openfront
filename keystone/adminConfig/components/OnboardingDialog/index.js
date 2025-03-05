import { Button } from "@keystone/themes/Tailwind/orion/primitives/default/ui/button";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@keystone/themes/Tailwind/orion/primitives/default/ui/dialog";
import { useApolloClient } from "@keystone-6/core/admin-ui/apollo";
import { useState } from "react";
import OnboardingContent from "./OnboardingContent";

export const OnboardingDialog = ({ data }) => {
  const client = useApolloClient();
  const [open, setOpen] = useState(false);


  // if (!data) {
  //   return null;
  // }

  // const needsOnboarding =
  //   data.Region === 0 ||
  //   data.PaymentProvider === 0 ||
  //   data.ShippingOption === 0 ||
  //   data.ProductCategory === 0 ||
  //   data.ProductCollection === 0 ||
  //   data.Product === 0;

  // if (!needsOnboarding) {
  //   return null;
  // }

  const handleClose = async () => {
    // Close the dialog
    setOpen(false);
    // Refetch all active queries when dialog closes
    await client.refetchQueries({
      include: "active",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-blue-700 dark:text-blue-400">
          <AlertCircle />
          Onboarding
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-0 p-0 sm:max-w-xl overflow-y-auto max-h-[80vh]">
        <OnboardingContent data={data} onClose={handleClose} showFinalInfo={true} />
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingDialog;
