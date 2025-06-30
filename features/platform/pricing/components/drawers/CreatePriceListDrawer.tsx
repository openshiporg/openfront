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

interface CreatePriceListDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CreatePriceListDrawer({ open, onClose }: CreatePriceListDrawerProps) {
  const handleCreate = () => {
    toast.success("Price List creation drawer will use EditItemDrawer pattern");
    onClose();
  };

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle>Create Price List</DrawerTitle>
              <DrawerDescription>
                Create a new pricing strategy for customer segments
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
              Price List creation will be implemented using the EditItemDrawer pattern
              with fields for name, type, customer groups, and product pricing rules.
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