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
})
