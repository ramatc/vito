import { describe, expect, it } from 'vitest'
import { visualStateFor } from '../visualState'

/**
 * `visualStateFor` picks the avatar's pose, face and animation loop. Pose and
 * animation follow `idleStateFor`'s priority exactly (`allDone` beats mood);
 * face is a pure one-to-one mapping from mood and never depends on `allDone`.
 */
describe('visualStateFor', () => {
  it('returns the celebrating pose and cheer animation when today is fully done, regardless of mood', () => {
    expect(visualStateFor({ mood: 'thriving', allDone: true })).toMatchObject({
      pose: 'celebrating',
      animation: 'cheer',
    })
    expect(visualStateFor({ mood: 'sleepy', allDone: true })).toMatchObject({
      pose: 'celebrating',
      animation: 'cheer',
    })
  })

  it('returns the tired pose and resting animation for a resting or sleepy mood when the day is not done', () => {
    expect(visualStateFor({ mood: 'resting', allDone: false })).toMatchObject({
      pose: 'tired',
      animation: 'resting',
    })
    expect(visualStateFor({ mood: 'sleepy', allDone: false })).toMatchObject({
      pose: 'tired',
      animation: 'resting',
    })
  })

  it('returns the neutral pose and idle animation for every other mood when the day is not done', () => {
    expect(visualStateFor({ mood: 'thriving', allDone: false })).toMatchObject({
      pose: 'neutral',
      animation: 'idle',
    })
    expect(visualStateFor({ mood: 'happy', allDone: false })).toMatchObject({
      pose: 'neutral',
      animation: 'idle',
    })
    expect(visualStateFor({ mood: 'content', allDone: false })).toMatchObject({
      pose: 'neutral',
      animation: 'idle',
    })
  })

  it('maps every mood to its own face, independent of allDone', () => {
    expect(visualStateFor({ mood: 'thriving', allDone: false }).face).toBe('thriving')
    expect(visualStateFor({ mood: 'happy', allDone: false }).face).toBe('happy')
    expect(visualStateFor({ mood: 'content', allDone: false }).face).toBe('neutral')
    expect(visualStateFor({ mood: 'sleepy', allDone: false }).face).toBe('tired')
    expect(visualStateFor({ mood: 'resting', allDone: false }).face).toBe('sleeping')

    expect(visualStateFor({ mood: 'content', allDone: true }).face).toBe('neutral')
  })
})
