import { describe, it, expect } from 'vitest'
import { scaleNotes, SCALES } from 'theory/scales'

const semis = (root, key) => scaleNotes(root, key).map((n) => n.semitone)

describe('scaleNotes', () => {
  it('builds C major', () => {
    expect(semis('C', 'major')).toEqual([0, 2, 4, 5, 7, 9, 11])
  })

  it('builds A minor (aeolian) with wraparound', () => {
    expect(semis('A', 'minor')).toEqual([9, 11, 0, 2, 4, 5, 7])
  })

  it('treats aeolian and minor as the same intervals', () => {
    expect(semis('A', 'aeolian')).toEqual(semis('A', 'minor'))
  })

  it('builds G major pentatonic', () => {
    expect(semis('G', 'major_pentatonic')).toEqual([7, 9, 11, 2, 4])
  })

  it('tags degrees in order starting at 0', () => {
    expect(scaleNotes('C', 'major').map((n) => n.degree)).toEqual([0, 1, 2, 3, 4, 5, 6])
  })

  it('throws on unknown scale', () => {
    expect(() => scaleNotes('C', 'bogus')).toThrow()
  })

  it('every scale key has a human name and intervals starting at 0', () => {
    for (const key of Object.keys(SCALES)) {
      expect(typeof SCALES[key].name).toBe('string')
      expect(SCALES[key].intervals[0]).toBe(0)
    }
  })

  it('builds C minor blues', () => {
    expect(semis('C', 'blues')).toEqual([0, 3, 5, 6, 7, 10])
  })

  it('builds C whole tone', () => {
    expect(semis('C', 'whole_tone')).toEqual([0, 2, 4, 6, 8, 10])
  })

  it('builds C diminished (whole-half) as an 8-note scale', () => {
    expect(semis('C', 'diminished_wh')).toEqual([0, 2, 3, 5, 6, 8, 9, 11])
  })

  it('marks minor as an alias (hidden from the dropdown) but keeps it resolvable', () => {
    expect(SCALES.minor.alias).toBe(true)
    expect(SCALES.aeolian.alias).toBeUndefined()
    expect(semis('C', 'minor')).toEqual(semis('C', 'aeolian'))
  })

  it('uses only URL-safe keys', () => {
    for (const key of Object.keys(SCALES)) expect(key).toMatch(/^[a-z0-9_]+$/)
  })
})
