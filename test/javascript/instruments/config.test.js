import { describe, it, expect } from 'vitest'
import { INSTRUMENTS } from 'instruments/config'

describe('INSTRUMENTS', () => {
  it('defines guitar as a fretboard with standard tuning', () => {
    expect(INSTRUMENTS.guitar.type).toBe('fretboard')
    expect(INSTRUMENTS.guitar.tuning).toEqual(['E', 'A', 'D', 'G', 'B', 'E'])
    expect(INSTRUMENTS.guitar.frets).toBe(17)
  })

  it('defines piano as a keyboard', () => {
    expect(INSTRUMENTS.piano.type).toBe('keyboard')
    expect(INSTRUMENTS.piano.octaves).toBeGreaterThan(0)
    expect(INSTRUMENTS.piano.startNote).toBe('C')
  })

  it('defines trumpet as a Bb brass instrument (written a major 2nd up)', () => {
    expect(INSTRUMENTS.trumpet.type).toBe('brass')
    expect(INSTRUMENTS.trumpet.transpose).toBe(2)
    expect(INSTRUMENTS.trumpet.valves).toBe(3)
    expect(INSTRUMENTS.trumpet.clef).toBe('treble')
  })

  it('every instrument has a display name and a known renderer type', () => {
    for (const key of Object.keys(INSTRUMENTS)) {
      expect(typeof INSTRUMENTS[key].name).toBe('string')
      expect(['fretboard', 'keyboard', 'brass']).toContain(INSTRUMENTS[key].type)
    }
  })
})
