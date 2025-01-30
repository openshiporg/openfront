"use client";
import { useId, useState } from "react";
import { MoreHorizontal, PenSquare, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { Button } from "@ui/button";
import { useDrawer } from "@keystone/themes/Tailwind/orion/components/Modals/drawer-context";
import { useList } from "@keystone/keystoneProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import { useDeleteItem } from "@keystone/themes/Tailwind/orion/components/EditItemDrawer";

export function ShippingProviderCard({ provider, onToggle }) {
  const id = useId();
  const { openEditDrawer } = useDrawer();
  const list = useList("ShippingProvider");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { handleDelete } = useDeleteItem("ShippingProvider");

  const handleDeleteProvider = async () => {
    const result = await handleDelete(provider.id, provider.name);
    if (result) {
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div className="inline-flex -space-x-px rounded-lg shadow-sm shadow-black/5 rtl:space-x-reverse">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onToggle(provider.id)}
          className={`h-6 w-6 rounded-none shadow-none first:rounded-s-lg focus-visible:z-10 ${!provider.isActive ? 'opacity-75' : ''}`}
        >
          <div
            className={`size-2.5 rounded-full border-2 ${
              provider.isActive
                ? "bg-green-500 border-green-200"
                : "bg-red-500 border-red-200"
            }`}
          />
        </Button>
        <Button
          variant="outline"
          className={`h-6 px-2 text-xs rounded-none shadow-none focus-visible:z-10 ${!provider.isActive ? 'opacity-75' : ''}`}
        >
          <span className="uppercase">{provider.name}</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={`h-6 w-6 [&_svg]:size-3 rounded-none shadow-none last:rounded-e-lg focus-visible:z-10 ${!provider.isActive ? 'opacity-75' : ''}`}
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => openEditDrawer(provider.id, "ShippingProvider")}
              className="gap-2 font-medium tracking-wide text-xs"
            >
              <PenSquare className="h-3.5 w-3.5" />
              EDIT PROVIDER
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setShowDeleteDialog(true)}
              className="gap-2 font-medium tracking-wide text-xs text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
              DELETE PROVIDER
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Provider</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {provider.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProvider}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
