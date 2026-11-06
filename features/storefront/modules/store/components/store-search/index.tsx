"use client"

import { Search, X } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

/** Product search on the store page: the query lives in ?q= so results can be shared and revisited. */
export default function StoreSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(initialQuery)

  const go = (next: string) => {
    const params = new URLSearchParams(searchParams ?? undefined)
    const trimmed = next.trim().slice(0, 100)
    if (trimmed) params.set("q", trimmed)
    else params.delete("q")
    params.delete("page")
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <form
      role="search"
      className="mb-8 flex w-full max-w-xl items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        go(value)
      }}
    >
      <label htmlFor="store-search" className="sr-only">Search products</label>
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          id="store-search"
          type="search"
          name="q"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search products"
          maxLength={100}
          autoComplete="off"
          className="h-11 w-full rounded-md border border-border bg-background pl-9 pr-9 text-base text-foreground outline-none focus:border-foreground"
          data-testid="store-search-input"
        />
        {value ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setValue("")
              go("")
            }}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>
      <button type="submit" className="h-11 rounded-md bg-foreground px-4 text-sm font-medium text-background" data-testid="store-search-submit">
        Search
      </button>
    </form>
  )
}
