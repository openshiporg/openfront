'use client'

import React from 'react'
import { useFormattedTime } from '../lib/useViewerTime'
import type { StoreTimeStyle } from '../lib/storeTime'

/** Date or date-time in the viewer's browser zone (date-times carry a short zone label). */
export function ViewerTime({
  value,
  style = 'datetime',
  timeZone,
  fallback = '—',
}: {
  value: Date | string | number | null | undefined
  style?: StoreTimeStyle
  timeZone?: string | null
  fallback?: string
}) {
  const text = useFormattedTime(value, style, timeZone)
  if (value == null || value === '') return <>{fallback}</>
  return <span suppressHydrationWarning>{text}</span>
}
