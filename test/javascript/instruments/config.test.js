import { describe, it, expect } from 'vitest'
import { INSTRUMENTS, defaultTuningKey, tuningStrings } from 'instruments/config'
import { noteToNumber } from 'theory/notes'

describe('INSTRUMENTS', () => {
  it('defines guitar as a fretboard with a standard tuning', () => {
    expect(INSTRUMENTS.guitar.type).toBe('fretboard')
    expect(INSTRUMENTS.guitar.tunings.standard.strings).toEqual(['E', 'A', 'D', 'G', 'B', 'E'])
    expect(INSTRUMENTS.guitar.frets).toBe(17)
  })

  it('defines piano as a keyboard', () => {
    expect(INSTRUMENTS.piano.type).toBe('keyboard')
    expect(INSTRUMENTS.piano.octaves).toBeGreaterThan(0)
    expect(INSTRUMENTS.piano.startNote).toBe('C')
  })

  it('defines trumpet as a 3-valve brass instrument on treble clef', () => {
    expect(INSTRUMENTS.trumpet.type).toBe('brass')
    expect(INSTRUMENTS.trumpet.valves).toBe(3)
    expect(INSTRUMENTS.trumpet.clef).toBe('treble')
  })

  it('every instrument has a display name and a known renderer type', () => {
    for (const key of Object.keys(INSTRUMENTS)) {
      expect(typeof INSTRUMENTS[key].name).toBe('string')
      expect(['fretboard', 'keyboard', 'brass']).toContain(INSTRUMENTS[key].type)
    }
  })

  it('every fretboard tuning uses note names the theory core recognizes', () => {
    for (const key of Object.keys(INSTRUMENTS)) {
      const config = INSTRUMENTS[key]
      if (config.type !== 'fretboard') continue
      expect(config.tunings).toBeTruthy()
      for (const tKey of Object.keys(config.tunings)) {
        config.tunings[tKey].strings.forEach((note) => {
          expect(() => noteToNumber(note)).not.toThrow()
        })
      }
    }
  })
})

describe('tuning helpers', () => {
  it('defaultTuningKey returns the first tuning key (null for non-fretboard)', () => {
    expect(defaultTuningKey(INSTRUMENTS.guitar)).toBe('standard')
    expect(defaultTuningKey(INSTRUMENTS.piano)).toBe(null)
  })

  it('tuningStrings resolves the named tuning, falling back to default', () => {
    expect(tuningStrings(INSTRUMENTS.guitar, 'dadgad')).toEqual(['D', 'A', 'D', 'G', 'A', 'D'])
    expect(tuningStrings(INSTRUMENTS.guitar, 'bogus')).toEqual(['E', 'A', 'D', 'G', 'B', 'E'])
    expect(tuningStrings(INSTRUMENTS.bass, 'five')).toEqual(['B', 'E', 'A', 'D', 'G'])
  })
})
