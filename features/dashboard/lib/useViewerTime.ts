'use client'

import { useSyncExternalStore } from 'react'
import { formatInZone, type StoreTimeStyle } from './storeTime'

const subscribeNoop = () => () => {}

/** false during SSR and hydration, true afterwards. */
export function useIsMounted() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false)
}

/**
 * Formats in the viewer's browser zone (or an explicit zone). Returns '' until mounted,
 * so server and hydration output match and no wrong-zone text ever flashes.
 */
export function useFormattedTime(
  date: Date | string | number | null | undefined,
  style: StoreTimeStyle = 'datetime',
  timeZone?: string | null
): string {
  const mounted = useIsMounted()
  return mounted ? formatInZone(date, timeZone, style) : ''
}
