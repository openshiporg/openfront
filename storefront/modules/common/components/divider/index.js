import { clx } from "@medusajs/ui"

const Divider = ({
  className
}) => (
  <div className={clx("h-px w-full border-b border-gray-200 mt-1", className)} />
)

export default Divider
