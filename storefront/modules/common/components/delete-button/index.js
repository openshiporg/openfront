import { Spinner, Trash } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { useState } from "react"

import { deleteLineItem } from "@storefront/modules/cart/actions"

const DeleteButton = ({
  id,
  children,
  className
}) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id) => {
    setIsDeleting(true)
    await deleteLineItem(id).catch((err) => {
      setIsDeleting(false)
    })
  }

  return (
    <div
      className={clx("flex items-center justify-between text-small-regular", className)}>
      <button
        className="flex gap-x-1 text-ui-fg-subtle hover:text-ui-fg-base cursor-pointer"
        onClick={() => handleDelete(id)}>
        {isDeleting ? <Spinner className="animate-spin" /> : <Trash />}
        <span>{children}</span>
      </button>
    </div>
  );
}

export default DeleteButton
