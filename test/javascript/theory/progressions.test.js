import { describe, it, expect } from 'vitest'
import { PROGRESSIONS, progressionChords } from 'theory/progressions'

describe('progressionChords', () => {
  it('maps degree indices to the diatonic chords of C major (I–V–vi–IV)', () => {
    const chords = progressionChords('C', 'major', 'sharp', [0, 4, 5, 3])
    expect(chords.map((c) => c.label)).toEqual(['C', 'G', 'Am', 'F'])
    expect(chords.map((c) => c.roman)).toEqual(['I', 'V', 'vi', 'IV'])
  })

  it('carries playable notes for each chord', () => {
    const chords = progressionChords('C', 'major', 'sharp', [0])
    // C major triad: C E G -> semitones 0,4,7
    expect(chords[0].notes.map((n) => n.semitone)).toEqual([0, 4, 7])
  })

  it('adjusts roman numerals to the scale (A minor)', () => {
    const chords = progressionChords('A', 'aeolian', 'sharp', [0, 4, 5, 3])
    expect(chords.map((c) => c.roman)).toEqual(['i', 'v', 'VI', 'iv'])
  })

  it('returns nothing for scales without diatonic harmony', () => {
    expect(progressionChords('C', 'major_pentatonic', 'sharp', [0, 4, 5, 3])).toEqual([])
  })

  it('ships a curated list of progressions', () => {
    expect(PROGRESSIONS.length).toBeGreaterThanOrEqual(4)
    PROGRESSIONS.forEach((p) => {
      expect(typeof p.name).toBe('string')
      expect(Array.isArray(p.degrees)).toBe(true)
    })
  })
})
