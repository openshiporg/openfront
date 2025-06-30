"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";

interface CreateDiscountDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CreateDiscountDrawer({ open, onClose }: CreateDiscountDrawerProps) {
  const handleCreate = () => {
    toast.success("Discount creation drawer will use EditItemDrawer pattern");
    onClose();
  };

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle>Create Discount</DrawerTitle>
              <DrawerDescription>
                Create a new discount code or promotion
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="w-4 h-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="px-6 pb-6">
          <div className="max-w-md mx-auto text-center space-y-4">
            <p className="text-muted-foreground">
              Discount creation will be implemented using the EditItemDrawer pattern
              with fields for discount code, type, value, and validity period.
            </p>
            <Button onClick={handleCreate}>
              Implement with EditItemDrawer
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}