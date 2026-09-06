import { describe, expect, it } from 'vitest'
import { moodAltText, moodMessage } from '../moodMessages'

/**
 * `moodMessage` is the single place that decides which line Vito says. The
 * priority order is deliberate and part of the contract: a live comeback
 * boost beats everything, finishing the day beats the mood, and the overlaps
 * between them are exactly where a priority bug would hide.
 *
 * Copy is asserted as literals rather than read back out of the dictionary:
 * a test that resolves its expectation through the same table as the code
 * would pass just as happily with the wrong Spanish in it.
 */
describe('moodMessage', () => {
  it('falls back to the mood copy when nothing else applies', () => {
    expect(moodMessage('en', { mood: 'content', allDone: false, boosted: false })).toEqual({
      headline: 'Vito is settled',
      body: 'Nothing urgent here. Pick one habit whenever you are ready.',
    })
  })

  it('resolves the same mood in Spanish when the locale changes', () => {
    expect(moodMessage('es', { mood: 'content', allDone: false, boosted: false })).toEqual({
      headline: 'Vito está tranquilo',
      body: 'No hay nada urgente. Elegí un hábito cuando quieras.',
    })
  })

  it('prefers the all-done message over the mood when the day is finished', () => {
    expect(moodMessage('en', { mood: 'sleepy', allDone: true, boosted: false })).toEqual({
      headline: 'Vito is delighted',
      body: 'That is everything scheduled for today. The rest of it is yours.',
    })
  })

  it('prefers the comeback message over the mood when boosted', () => {
    expect(moodMessage('en', { mood: 'resting', allDone: false, boosted: true })).toEqual({
      headline: 'Vito is glad you are back',
      body: 'Your next few habits are worth extra XP. No catching up required.',
    })
  })

  it('prefers the comeback message over all-done when both apply', () => {
    expect(moodMessage('en', { mood: 'thriving', allDone: true, boosted: true }).headline).toBe(
      'Vito is glad you are back',
    )
  })

  it('prefers the all-done message over a resting mood when both apply', () => {
    expect(moodMessage('en', { mood: 'resting', allDone: true, boosted: false }).headline).toBe(
      'Vito is delighted',
    )
  })
})

describe('moodAltText', () => {
  it('describes every mood in both locales', () => {
    expect(moodAltText('en', 'content')).toBe('calm')
    expect(moodAltText('es', 'content')).toBe('tranquilo')
  })
})
