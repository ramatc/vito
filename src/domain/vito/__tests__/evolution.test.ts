import { describe, expect, it } from 'vitest'
import { EVOLUTION_BRACKETS, getEvolutionStage } from '../evolution'

describe('EVOLUTION_BRACKETS', () => {
  it('lists four stages with strictly increasing entry levels', () => {
    expect(EVOLUTION_BRACKETS.map((bracket) => bracket.stage)).toEqual([1, 2, 3, 4])
    expect(EVOLUTION_BRACKETS.map((bracket) => bracket.minLevel)).toEqual([1, 4, 8, 13])
    expect(EVOLUTION_BRACKETS.map((bracket) => bracket.key)).toEqual([
      'base',
      'growing',
      'evolved',
      'advanced',
    ])
  })
})

describe('getEvolutionStage', () => {
  it('stays on stage 1 through the whole base band', () => {
    expect(getEvolutionStage(1)).toBe(1)
    expect(getEvolutionStage(2)).toBe(1)
    expect(getEvolutionStage(3)).toBe(1)
  })

  it('advances to stage 2 at level 4', () => {
    expect(getEvolutionStage(3)).toBe(1)
    expect(getEvolutionStage(4)).toBe(2)
  })

  it('advances to stage 3 at level 8', () => {
    expect(getEvolutionStage(7)).toBe(2)
    expect(getEvolutionStage(8)).toBe(3)
  })

  it('advances to stage 4 at level 13', () => {
    expect(getEvolutionStage(12)).toBe(3)
    expect(getEvolutionStage(13)).toBe(4)
  })

  it('clamps a level below 1 to the first stage instead of returning nothing', () => {
    expect(getEvolutionStage(0)).toBe(1)
    expect(getEvolutionStage(-7)).toBe(1)
  })

  it('clamps far past the last bracket to the final stage', () => {
    expect(getEvolutionStage(99)).toBe(4)
    expect(getEvolutionStage(999)).toBe(4)
  })

  it('never decreases as the level rises', () => {
    let previous = getEvolutionStage(1)

    for (let level = 2; level <= 99; level += 1) {
      const stage = getEvolutionStage(level)

      expect(stage).toBeGreaterThanOrEqual(previous)
      previous = stage
    }

    expect(previous).toBe(4)
  })
})
