import { ArrowUpRight } from "lucide-react"
import LocalizedClientLink from "../localized-client-link"

type InteractiveLinkProps = {
  href: string
  children?: React.ReactNode
  onClick?: () => void
}

const InteractiveLink = ({
  href,
  children,
  onClick,
  ...props
}: InteractiveLinkProps) => {
  return (
    <LocalizedClientLink
      className="flex gap-x-1 items-center group"
      href={href}
      onClick={onClick}
      {...props}
    >
      <span className="text-sm">{children}</span>
      <ArrowUpRight className="group-hover:rotate-45 ease-in-out duration-150 text-primary h-4 w-4" />
    </LocalizedClientLink>
  )
}

export default InteractiveLink
