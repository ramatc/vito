import { describe, expect, it } from 'vitest'
import type { Difficulty } from '../../../types/models'
import { XP_BY_DIFFICULTY, xpRewardFor } from '../xpReward'

describe('xpRewardFor', () => {
  it('awards 10 XP for an easy habit', () => {
    expect(xpRewardFor('easy')).toBe(10)
  })

  it('awards 20 XP for a normal habit', () => {
    expect(xpRewardFor('normal')).toBe(20)
  })

  it('awards 30 XP for a hard habit', () => {
    expect(xpRewardFor('hard')).toBe(30)
  })

  it('reads its values from XP_BY_DIFFICULTY rather than inlining the curve', () => {
    const difficulties: Difficulty[] = ['easy', 'normal', 'hard']

    for (const difficulty of difficulties) {
      expect(xpRewardFor(difficulty)).toBe(XP_BY_DIFFICULTY[difficulty])
    }
  })
})

describe('XP_BY_DIFFICULTY', () => {
  it('covers every difficulty exactly once, in increasing order', () => {
    expect(Object.keys(XP_BY_DIFFICULTY)).toEqual(['easy', 'normal', 'hard'])
    expect(XP_BY_DIFFICULTY.easy).toBeLessThan(XP_BY_DIFFICULTY.normal)
    expect(XP_BY_DIFFICULTY.normal).toBeLessThan(XP_BY_DIFFICULTY.hard)
  })
})
