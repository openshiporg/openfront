"use client";

import { useState } from "react";
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

interface CreateCurrencyDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CreateCurrencyDrawer({ open, onClose }: CreateCurrencyDrawerProps) {
  const handleCreate = () => {
    toast.success("Currency creation drawer will use EditItemDrawer pattern - similar to region creation");
    onClose();
  };

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle>Create Currency</DrawerTitle>
              <DrawerDescription>
                Add a new currency to the system
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
              Currency creation will be implemented using the EditItemDrawer pattern
              with fields for currency code, name, symbol, and native symbol.
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