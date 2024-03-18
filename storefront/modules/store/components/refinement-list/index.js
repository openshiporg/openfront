"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

import SortProducts from "./sort-products";

const RefinementList = ({
  sortBy
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback((name, value) => {
    const params = new URLSearchParams(searchParams)
    params.set(name, value)

    return params.toString();
  }, [searchParams])

  const setQueryParams = (name, value) => {
    const query = createQueryString(name, value)
    router.push(`${pathname}?${query}`)
  }

  return (
    <div
      className="flex small:flex-col gap-12 py-4 mb-8 small:px-0 pl-6 small:min-w-[250px] small:ml-[1.675rem]">
      <SortProducts sortBy={sortBy} setQueryParams={setQueryParams} />
    </div>
  );
}

export default RefinementList
