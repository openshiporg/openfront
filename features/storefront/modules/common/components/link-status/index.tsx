"use client"
import { useLinkStatus } from 'next/link'
import { RiLoader2Fill } from "@remixicon/react"

const LinkStatus = () => {
  const { pending } = useLinkStatus()
  return pending ? (
    <RiLoader2Fill 
      aria-label="Loading"
      className="mr-2 h-4 w-4 animate-spin"
    />
  ) : null
}

export default LinkStatus 