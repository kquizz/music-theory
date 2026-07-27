import { describe, it, expect } from 'vitest'
import { EAR_INTERVALS, EAR_CHORDS, intervalMidis, chordMidis } from 'theory/ear_training'

describe('ear training content', () => {
  it('covers the twelve intervals from m2 to the octave', () => {
    expect(EAR_INTERVALS).toHaveLength(12)
    expect(EAR_INTERVALS[0]).toMatchObject({ semitones: 1, short: 'm2' })
    expect(EAR_INTERVALS[6]).toMatchObject({ semitones: 7, short: 'P5' })
    expect(EAR_INTERVALS[11]).toMatchObject({ semitones: 12, short: 'P8' })
  })

  it('derives chord qualities from the shared CHORDS table', () => {
    const maj = EAR_CHORDS.find((c) => c.key === 'maj')
    expect(maj.intervals).toEqual([0, 4, 7])
    expect(EAR_CHORDS.map((c) => c.key)).toContain('dim')
    EAR_CHORDS.forEach((c) => expect(typeof c.name).toBe('string'))
  })
})

describe('question builders', () => {
  it('builds an interval as root + offset', () => {
    expect(intervalMidis(60, 7)).toEqual([60, 67]) // C4 up a fifth
  })

  it('builds a chord as root + each interval', () => {
    expect(chordMidis(60, [0, 4, 7])).toEqual([60, 64, 67]) // C major triad
  })
})
