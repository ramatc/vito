import { describe, expect, it } from 'vitest'
import { idleStateFor } from './variants'

/**
 * `idleStateFor` picks which loop Vito falls back to when no reaction is
 * playing. The priority order is the contract: `allDone` beats mood, and only
 * the quiet moods drop to `resting`.
 */
describe('idleStateFor', () => {
  it('returns cheer when today is fully done, regardless of mood', () => {
    expect(idleStateFor({ mood: 'thriving', allDone: true })).toBe('cheer')
    expect(idleStateFor({ mood: 'sleepy', allDone: true })).toBe('cheer')
  })

  it('returns resting for a resting or sleepy mood when the day is not done', () => {
    expect(idleStateFor({ mood: 'resting', allDone: false })).toBe('resting')
    expect(idleStateFor({ mood: 'sleepy', allDone: false })).toBe('resting')
  })

  it('returns idle for every other mood when the day is not done', () => {
    expect(idleStateFor({ mood: 'thriving', allDone: false })).toBe('idle')
    expect(idleStateFor({ mood: 'happy', allDone: false })).toBe('idle')
    expect(idleStateFor({ mood: 'content', allDone: false })).toBe('idle')
  })
})
