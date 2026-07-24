import { describe, it, expect } from 'vitest'
import { chordNotes, CHORDS } from 'theory/chords'

const semis = (root, key) => chordNotes(root, key).map((n) => n.semitone)

describe('chordNotes', () => {
  it('builds C major triad', () => {
    expect(semis('C', 'maj')).toEqual([0, 4, 7])
  })

  it('builds A minor triad with wraparound', () => {
    expect(semis('A', 'min')).toEqual([9, 0, 4])
  })

  it('builds A dominant 7', () => {
    expect(semis('A', 'dom7')).toEqual([9, 1, 4, 7])
  })

  it('builds C major 7', () => {
    expect(semis('C', 'maj7')).toEqual([0, 4, 7, 11])
  })

  it('folds extended intervals into pitch classes (C9 = C E G Bb D)', () => {
    expect(semis('C', 'dom9')).toEqual([0, 4, 7, 10, 2])
  })

  it('builds a power chord (root + fifth only)', () => {
    expect(semis('C', 'power5')).toEqual([0, 7])
  })

  it('uses only URL-safe, non-integer keys', () => {
    for (const key of Object.keys(CHORDS)) {
      expect(key).toMatch(/^[a-z0-9_]+$/)
      expect(key).not.toMatch(/^\d+$/)
    }
  })

  it('tags degrees 0..n', () => {
    expect(chordNotes('C', 'maj7').map((n) => n.degree)).toEqual([0, 1, 2, 3])
  })

  it('throws on unknown quality', () => {
    expect(() => chordNotes('C', 'bogus')).toThrow()
  })

  it('every quality has a name and intervals starting at 0', () => {
    for (const key of Object.keys(CHORDS)) {
      expect(typeof CHORDS[key].name).toBe('string')
      expect(CHORDS[key].intervals[0]).toBe(0)
    }
  })
})
