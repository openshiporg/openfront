'use client'

import { Sparkles } from 'lucide-react'
import { useSidebarWithSide } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

/**
 * Phone-only assistant trigger that sits in the page header. While it is on
 * screen the floating corner button is hidden on phones (see globals.css), so
 * the assistant never covers row actions, prices or statuses.
 */
export function AssistantHeaderButton({ className }: { className?: string }) {
  const { toggleSidebar } = useSidebarWithSide('right')
  return (
    <button
      type="button"
      data-assistant-header=""
      onClick={toggleSidebar}
      aria-label="Open assistant"
      className={cn('inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background shadow-sm transition-colors hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden', className)}
    >
      <Sparkles className="size-4" aria-hidden="true" />
    </button>
  )
}
