"use client";

import { Plus, PenSquare, Trash2 } from "lucide-react";
import { useDrawer } from "@keystone/themes/Tailwind/orion/components/Modals/drawer-context";
import { useDeleteItem } from "@keystone/themes/Tailwind/orion/components/EditItemDrawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";

export function ProviderActionsInline({
  provider,
  onProviderToggle,
  children,
  onDelete,
}) {
  const { openEditDrawer } = useDrawer();
  const { handleDelete } = useDeleteItem("ShippingProvider");

  const handleDeleteProvider = async () => {
    const result = await handleDelete(provider.id, provider.name);
    if (result?.success) {
      // If the provider was deleted successfully, call onDelete callback
      onDelete?.(provider);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => onProviderToggle(provider.id)}
          className="gap-2 font-medium tracking-wide text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          {provider?.isActive ? "DEACTIVATE" : "ACTIVATE"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => openEditDrawer(provider.id, "ShippingProvider")}
          className="gap-2 font-medium tracking-wide text-xs"
        >
          <PenSquare className="h-3.5 w-3.5" />
          EDIT PROVIDER
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDeleteProvider}
          className="gap-2 font-medium tracking-wide text-xs text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
          DELETE PROVIDER
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 