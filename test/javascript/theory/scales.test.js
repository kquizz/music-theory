import { describe, it, expect } from 'vitest'
import { scaleNotes, SCALES, stepPattern } from 'theory/scales'
import { relativePair } from 'theory/scales'
import { circleShape } from 'theory/circle_shape'

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

describe('formula', () => {
  it('every non-alias scale has a formula string', () => {
    for (const [key, scale] of Object.entries(SCALES)) {
      if (scale.alias) continue
      expect(typeof scale.formula, key).toBe('string')
      expect(scale.formula.length, key).toBeGreaterThan(0)
    }
  })
})

describe('stepPattern', () => {
  const pattern = (key) => stepPattern(SCALES[key].intervals)

  it('spells major and minor', () => {
    expect(pattern('major')).toBe('W W H W W W H')
    expect(pattern('aeolian')).toBe('W H W W H W W')
  })

  it('uses W+H for minor thirds', () => {
    expect(pattern('minor_pentatonic')).toBe('W+H W W W+H W')
    expect(pattern('blues')).toBe('W+H W H H W+H W')
    expect(pattern('harmonic_minor')).toBe('W H W W H W+H H')
  })

  it('handles symmetric scales and wide steps', () => {
    expect(pattern('whole_tone')).toBe('W W W W W W')
    expect(pattern('diminished_wh')).toBe('W H W H W H W H')
    expect(stepPattern([0, 4, 8])).toBe('2W 2W 2W')
    expect(stepPattern([0, 5])).toBe('5 7')
  })
})

describe('circleShape', () => {
  const shape = (key) => circleShape(SCALES[key].intervals)

  it('describes diatonic modes as 7 in a row', () => {
    for (const key of ['major', 'dorian', 'lydian', 'aeolian', 'locrian']) {
      expect(shape(key)).toBe('7 neighbors in a row on the circle')
    }
  })

  it('describes pentatonics as 5 in a row', () => {
    expect(shape('major_pentatonic')).toBe('5 neighbors in a row on the circle')
    expect(shape('minor_pentatonic')).toBe('5 neighbors in a row on the circle')
  })

  it('describes blues as a block plus one stray note', () => {
    expect(shape('blues')).toBe('5 neighbors in a row + 1 note elsewhere on the circle')
  })

  it('pluralizes strays and handles symmetric scales', () => {
    expect(shape('harmonic_minor')).toBe('4 neighbors in a row + 3 notes elsewhere on the circle')
    expect(shape('whole_tone')).toBe('every other spot on the circle')
    expect(circleShape([0, 3, 6, 9])).toBe('4 single notes, spread evenly around the circle')
    expect(shape('diminished_wh')).toBe('4 pairs, spread evenly around the circle')
    expect(shape('diminished_hw')).toBe('4 pairs, spread evenly around the circle')
  })
})

describe('relativePair', () => {
  it('pairs major/minor, blues and pentatonics', () => {
    expect(relativePair('blues')).toEqual({ major: 'major_blues', minor: 'blues' })
    expect(relativePair('major_pentatonic')).toEqual({ major: 'major_pentatonic', minor: 'minor_pentatonic' })
    expect(relativePair('minor')).toEqual({ major: 'major', minor: 'aeolian' })
    expect(relativePair('dorian')).toBeNull()
  })

  it('pairs share every note when the minor root is 3 semitones lower', () => {
    for (const key of ['blues', 'major_blues', 'minor_pentatonic', 'aeolian']) {
      const { major, minor } = relativePair(key)
      const maj = SCALES[major].intervals.map((i) => (i + 3) % 12).sort((a, b) => a - b)
      const min = [...SCALES[minor].intervals].sort((a, b) => a - b)
      expect(maj).toEqual(min)
    }
  })
})
