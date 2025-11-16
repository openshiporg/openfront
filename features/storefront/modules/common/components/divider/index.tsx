import { cn } from "@/lib/utils"

const Divider = ({ className }: { className?: string }) => (
  <div
    className={cn("h-px w-full border-b mt-1", className)}
  />
)

export default Divider
