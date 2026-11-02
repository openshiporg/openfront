/**
 * Date/time formatting with an optional explicit IANA zone. `undefined` means the
 * viewer's own browser zone. Callers must only render viewer-zone text after mount
 * (see ViewerTime) so server and client output never differ.
 */

export type StoreTimeStyle = 'datetime' | 'long' | 'date' | 'dateLong'

export function isValidTimeZone(timeZone: unknown): timeZone is string {
  if (typeof timeZone !== 'string' || !timeZone.trim()) return false
  try {
    new Intl.DateTimeFormat('en-US', { timeZone })
    return true
  } catch {
    return false
  }
}

/** A valid explicit zone, or undefined (= viewer zone). */
export function resolveTimeZone(timeZone: unknown): string | undefined {
  return isValidTimeZone(timeZone) ? timeZone : undefined
}

const STYLE_OPTIONS: Record<StoreTimeStyle, Intl.DateTimeFormatOptions> = {
  // Nov 2, 2026, 10:00 AM PST
  datetime: { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' },
  // November 2, 2026 at 10:00 AM PST
  long: { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' },
  // Nov 2, 2026 (no label)
  date: { year: 'numeric', month: 'short', day: 'numeric' },
  // November 2, 2026 (no label)
  dateLong: { year: 'numeric', month: 'long', day: 'numeric' },
}

export function formatInZone(
  date: Date | string | number | null | undefined,
  timeZone?: string | null,
  style: StoreTimeStyle = 'datetime'
): string {
  if (date == null || date === '') return ''
  const d = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', {
    ...STYLE_OPTIONS[style],
    timeZone: resolveTimeZone(timeZone),
  }).format(d)
}

export type ZonedParts = {
  year: number
  month: number // 1-12
  day: number
  hour: number
  minute: number
  second: number
}

/** Wall-clock parts of an instant in the given zone. */
export function getZonedParts(date: Date, timeZone?: string | null): ZonedParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: resolveTimeZone(timeZone),
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).formatToParts(date)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour') % 24,
    minute: get('minute'),
    second: get('second'),
  }
}

function partsAsUtc(p: ZonedParts): number {
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
}

/** The instant whose wall-clock time in `timeZone` equals `parts`. */
export function zonedPartsToDate(parts: ZonedParts, timeZone?: string | null): Date {
  const zone = resolveTimeZone(timeZone)
  const wanted = partsAsUtc(parts)
  let guess = wanted
  // Two passes settle the offset, including across DST transitions.
  for (let i = 0; i < 2; i++) {
    const actual = partsAsUtc(getZonedParts(new Date(guess), zone))
    guess += wanted - actual
  }
  return new Date(guess)
}

/** "HH:mm:ss" wall-clock time of an instant in the zone, for a time input. */
export function formatTimeInputInZone(date: Date, timeZone?: string | null): string {
  const p = getZonedParts(date, timeZone)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(p.hour)}:${pad(p.minute)}:${pad(p.second)}`
}

/** Replace the store-zone time of day on an instant. */
export function withTimeInZone(
  date: Date,
  hours: number,
  minutes: number,
  seconds: number,
  timeZone?: string | null
): Date {
  const p = getZonedParts(date, timeZone)
  return zonedPartsToDate({ ...p, hour: hours, minute: minutes, second: seconds }, timeZone)
}

/**
 * A calendar day picked in the browser (local y/m/d) applied to the store zone,
 * keeping `base`'s store-zone time of day (or the current store-zone time).
 */
export function withCalendarDayInZone(
  picked: Date,
  base: Date | undefined,
  timeZone?: string | null
): Date {
  const time = getZonedParts(base ?? new Date(), timeZone)
  return zonedPartsToDate(
    {
      year: picked.getFullYear(),
      month: picked.getMonth() + 1,
      day: picked.getDate(),
      hour: time.hour,
      minute: time.minute,
      second: base ? time.second : 0,
    },
    timeZone
  )
}

/** A browser-local Date at noon on the store-zone calendar day, for the Calendar's `selected`. */
export function calendarDayForZone(date: Date, timeZone?: string | null): Date {
  const p = getZonedParts(date, timeZone)
  return new Date(p.year, p.month - 1, p.day, 12, 0, 0)
}
