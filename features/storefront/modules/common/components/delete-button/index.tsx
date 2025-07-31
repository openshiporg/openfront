import { deleteLineItem } from "@/features/storefront/lib/data/cart";
import { Trash2 } from "lucide-react"; 
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RiLoader2Fill } from "@remixicon/react";

const DeleteButton = ({
  id,
  children,
  className,
}: {
  id: string;
  children?: React.ReactNode;
  className?: string;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    await deleteLineItem(id).catch((err) => {
      setIsDeleting(false);
    });
  };

  return (
    <Button
      size="icon"
      variant="outline"
      onClick={() => handleDelete(id)}
      className="text-muted-foreground"
    >
      {isDeleting ? <RiLoader2Fill className="animate-spin" /> : <Trash2 />}
      {children && <span>{children}</span>}
    </Button>
  );
};

export default DeleteButton;
