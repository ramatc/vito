import { afterEach, describe, expect, it, vi } from 'vitest'
import { addDays, daysBetween, eachDay, todayKey, weekdayOf } from './date'

afterEach(() => {
  vi.useRealTimers()
})

describe('todayKey', () => {
  it('formats the local calendar day as YYYY-MM-DD', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 9, 13, 45))

    expect(todayKey()).toBe('2026-03-09')
  })

  it('zero-pads single-digit months and days', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 5, 0, 1))

    expect(todayKey()).toBe('2026-01-05')
  })

  it('reports the local day, not the UTC day, late in the evening', () => {
    vi.useFakeTimers()
    // 23:30 local on the 31st is already the 1st in UTC for negative offsets and
    // still the 31st for positive ones — either way the LOCAL day is what counts.
    vi.setSystemTime(new Date(2026, 11, 31, 23, 30))

    expect(todayKey()).toBe('2026-12-31')
  })
})

describe('weekdayOf', () => {
  it('returns 0 for a Sunday', () => {
    expect(weekdayOf('2026-03-08')).toBe(0)
  })

  it('returns 6 for a Saturday', () => {
    expect(weekdayOf('2026-03-14')).toBe(6)
  })

  it('returns 1 for a Monday', () => {
    expect(weekdayOf('2026-03-09')).toBe(1)
  })
})

describe('addDays', () => {
  it('advances within a month', () => {
    expect(addDays('2026-03-09', 3)).toBe('2026-03-12')
  })

  it('rolls over a month boundary', () => {
    expect(addDays('2026-01-30', 3)).toBe('2026-02-02')
  })

  it('rolls back across a year boundary with a negative offset', () => {
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
  })

  it('returns the same key for an offset of zero', () => {
    expect(addDays('2026-03-09', 0)).toBe('2026-03-09')
  })

  it('handles a leap day', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
  })

  it('is unaffected by a DST transition', () => {
    // 2026-03-29 is the European DST spring-forward; a naive local-time
    // implementation loses an hour here and can return the same day twice.
    expect(addDays('2026-03-28', 1)).toBe('2026-03-29')
    expect(addDays('2026-03-29', 1)).toBe('2026-03-30')
  })
})

describe('daysBetween', () => {
  it('counts forward days as a positive number', () => {
    expect(daysBetween('2026-03-09', '2026-03-12')).toBe(3)
  })

  it('returns 0 for the same day', () => {
    expect(daysBetween('2026-03-09', '2026-03-09')).toBe(0)
  })

  it('returns a negative number when the second key is earlier', () => {
    expect(daysBetween('2026-03-12', '2026-03-09')).toBe(-3)
  })

  it('counts across a DST transition without drifting', () => {
    expect(daysBetween('2026-03-01', '2026-04-01')).toBe(31)
  })
})

describe('eachDay', () => {
  it('lists every day inclusive of both endpoints', () => {
    expect(eachDay('2026-03-09', '2026-03-12')).toEqual([
      '2026-03-09',
      '2026-03-10',
      '2026-03-11',
      '2026-03-12',
    ])
  })

  it('returns a single day when from equals to', () => {
    expect(eachDay('2026-03-09', '2026-03-09')).toEqual(['2026-03-09'])
  })

  it('returns an empty list when to is before from', () => {
    // Not a trivial empty assertion: the range is inverted on purpose, and the
    // inclusive case above proves the same function yields entries otherwise.
    expect(eachDay('2026-03-12', '2026-03-09')).toEqual([])
  })

  it('spans a month boundary', () => {
    expect(eachDay('2026-01-30', '2026-02-02')).toEqual([
      '2026-01-30',
      '2026-01-31',
      '2026-02-01',
      '2026-02-02',
    ])
  })
})

describe('malformed date keys', () => {
  it('rejects a key that is not YYYY-MM-DD', () => {
    expect(() => weekdayOf('09/03/2026')).toThrow(RangeError)
  })

  it('rejects a calendar-impossible day instead of silently rolling it over', () => {
    expect(() => addDays('2026-02-30', 1)).toThrow(RangeError)
  })

  it('rejects an out-of-range month', () => {
    expect(() => daysBetween('2026-13-01', '2026-13-02')).toThrow(RangeError)
  })
})
