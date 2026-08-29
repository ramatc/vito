import { describe, expect, it } from 'vitest'
import {
  ALL_DONE_MESSAGE,
  COMEBACK_MESSAGE,
  MOOD_MESSAGES,
  moodMessage,
} from '../moodMessages'

/**
 * `moodMessage` is the single place that decides which line Vito says. The
 * priority order is deliberate and part of the contract: a live comeback
 * boost beats everything, finishing the day beats the mood, and the overlaps
 * between them are exactly where a priority bug would hide.
 */
describe('moodMessage', () => {
  it('falls back to the mood copy when nothing else applies', () => {
    expect(moodMessage({ mood: 'content', allDone: false, boosted: false })).toEqual(
      MOOD_MESSAGES.content,
    )
  })

  it('prefers the all-done message over the mood when the day is finished', () => {
    expect(moodMessage({ mood: 'sleepy', allDone: true, boosted: false })).toEqual(
      ALL_DONE_MESSAGE,
    )
  })

  it('prefers the comeback message over the mood when boosted', () => {
    expect(moodMessage({ mood: 'resting', allDone: false, boosted: true })).toEqual(
      COMEBACK_MESSAGE,
    )
  })

  it('prefers the comeback message over all-done when both apply', () => {
    expect(moodMessage({ mood: 'thriving', allDone: true, boosted: true })).toEqual(
      COMEBACK_MESSAGE,
    )
  })

  it('prefers the all-done message over a resting mood when both apply', () => {
    expect(moodMessage({ mood: 'resting', allDone: true, boosted: false })).toEqual(
      ALL_DONE_MESSAGE,
    )
  })
})
