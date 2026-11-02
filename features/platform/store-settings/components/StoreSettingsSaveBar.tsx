'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Store Settings save control. Below md it is pinned to the bottom of the
 * viewport (clear of the floating assistant button and the home indicator);
 * from md up it renders inline where the page places it.
 */
export function StoreSettingsSaveBar({
  onSave,
  isSaving,
  status,
  label = 'Save Settings',
  className,
}: {
  onSave: () => void
  isSaving: boolean
  status?: string | null
  label?: string
  className?: string
}) {
  const button = (
    <Button onClick={onSave} disabled={isSaving} className="h-10 rounded-full px-5 text-sm" type="button">
      {isSaving ? 'Saving...' : label}
    </Button>
  )

  return (
    <>
      <div className={cn('hidden md:flex md:items-center md:gap-3', className)}>
        {status ? <span className="text-xs text-muted-foreground">{status}</span> : null}
        {button}
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-end gap-3 border-t border-border bg-background/95 py-3 pl-4 pr-[4.5rem] pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
        {status ? <span className="mr-auto truncate text-xs text-muted-foreground">{status}</span> : null}
        {button}
      </div>
    </>
  )
}
