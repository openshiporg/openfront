import { ArrowUpRight } from "lucide-react"
import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "404",
  description: "Something went wrong",
}

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="text-xs font-normal text-foreground">
        The page you tried to access does not exist.
      </p>
      <Link
        className="flex gap-x-1 items-center group"
        href="/"
      >
        <span className="text-primary">Go to frontpage</span>
        <ArrowUpRight className="group-hover:rotate-45 ease-in-out duration-150 h-4 w-4 text-primary" />
      </Link>
    </div>
  )
}
