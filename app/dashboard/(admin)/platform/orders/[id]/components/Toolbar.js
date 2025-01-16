import React from "react";
import { Button } from "@ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ui/dialog";

export const Toolbar = React.memo(function Toolbar({
  hasChangedFields,
  loading,
  onSave,
  onReset,
}) {
  return (
    <div className="fixed bottom-0 right-0 w-full border-t bg-white p-4 dark:bg-zinc-900">
      <div className="flex items-center justify-end gap-4">
        {hasChangedFields ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Reset changes</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reset Changes</DialogTitle>
                <DialogDescription>
                  Are you sure you want to reset all changes?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <Button variant="destructive" onClick={onReset}>
                  Reset Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <div className="text-sm text-muted-foreground">No changes to save</div>
        )}
        <Button
          disabled={!hasChangedFields}
          isLoading={loading}
          onClick={onSave}
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}); 