import { describe, it, expect } from 'vitest'
import { fretboardPositions } from 'renderers/fretboard_renderer'

const config = { tuning: ['E', 'A', 'D', 'G', 'B', 'E'], frets: 5 }

describe('fretboardPositions', () => {
  it('maps a semitone set to {string, fret, degree} hits', () => {
    // open low E string is E (semitone 4); highlight E only.
    const hits = fretboardPositions(config, [{ semitone: 4, degree: 0 }])
    // string 0 (low E) open fret 0 is a hit
    expect(hits).toContainEqual({ string: 0, fret: 0, degree: 0 })
    // string 0 fret 5 is A (not E), not a hit at that position
    expect(hits.find((h) => h.string === 0 && h.fret === 5)).toBeUndefined()
  })

  it('includes hits across all strings and frets 0..frets inclusive', () => {
    const hits = fretboardPositions(config, [{ semitone: 9, degree: 3 }]) // A
    // low E string, fret 5 = A
    expect(hits).toContainEqual({ string: 0, fret: 5, degree: 3 })
    // A string open (fret 0) = A
    expect(hits).toContainEqual({ string: 1, fret: 0, degree: 3 })
  })

  it('carries degree through for coloring', () => {
    const hits = fretboardPositions(config, [{ semitone: 4, degree: 2 }])
    expect(hits.every((h) => h.degree === 2)).toBe(true)
  })
})
