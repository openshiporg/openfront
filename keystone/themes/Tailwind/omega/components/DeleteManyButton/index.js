import { Fragment, useMemo, useState } from "react";
import { useToasts } from "../Toast";
import { Button } from "../../primitives/default/ui/button";
import { deleteManyListItems } from "../../data/lists";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../primitives/default/ui/alert-dialog";

export function DeleteManyButton({
  selectedItems,
  list,
  isDisabled,
  totalItems,
  children,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toasts = useToasts();

  const deleteItems = async () => {
    setIsLoading(true);
    try {
      const deletedItems = await deleteManyListItems(list.key, [...selectedItems]);

      const { successfulItems, unsuccessfulItems, successMessage } = deletedItems.reduce(
        (acc, curr) => {
          if (curr) {
            acc.successfulItems++;
            acc.successMessage = acc.successMessage === ""
              ? curr[list.labelField]
              : `${acc.successMessage}, ${curr[list.labelField]}`;
          } else {
            acc.unsuccessfulItems++;
          }
          return acc;
        },
        {
          successfulItems: 0,
          unsuccessfulItems: 0,
          successMessage: "",
        }
      );

      if (unsuccessfulItems) {
        toasts.addToast({
          tone: "negative",
          title: `Failed to delete ${unsuccessfulItems} of ${deletedItems.length} ${list.plural}`,
          message: "Some items could not be deleted",
        });
      }

      if (successfulItems) {
        toasts.addToast({
          tone: "positive",
          title: `Deleted ${successfulItems} of ${deletedItems.length} ${list.plural} successfully`,
          message: successMessage,
        });
      }

    } catch (err) {
      toasts.addToast({
        title: "Failed to delete",
        tone: "negative",
        message: err.message,
      });
    }

    setIsOpen(false);
    setIsLoading(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={isDisabled || !selectedItems.size}
          {...props}
        >
          {children || `Delete ${selectedItems.size} of ${totalItems} ${list.plural}`}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Confirmation</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {selectedItems.size}{" "}
            {selectedItems.size === 1 ? list.singular : list.plural}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={deleteItems}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
