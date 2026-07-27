import { describe, it, expect } from 'vitest'
import { trumpetFingering, valveFingering, slidePosition, tubaFingering, absolutePitches } from 'renderers/fingering_renderer'

describe('trumpetFingering (by absolute pitch)', () => {
  it('fingers the low/middle register from the standard chart', () => {
    expect(trumpetFingering(60)).toEqual([]) //     C4 open
    expect(trumpetFingering(62)).toEqual([1, 3]) // D4  1-3
    expect(trumpetFingering(64)).toEqual([1, 2]) // E4  1-2
    expect(trumpetFingering(65)).toEqual([1]) //    F4  1
    expect(trumpetFingering(67)).toEqual([]) //     G4 open
  })

  it('changes fingering by octave in the upper register', () => {
    // The bug that was caught: high D is 1st valve, not 1-3 like low D.
    expect(trumpetFingering(74)).toEqual([1]) //  D5  (vs D4 = 1-3)
    expect(trumpetFingering(76)).toEqual([]) //   E5  open (vs E4 = 1-2)
    expect(trumpetFingering(72)).toEqual([]) //   C5  open
    expect(trumpetFingering(73)).toEqual([1, 2]) // C#5 (vs C#4 = 1-2-3)
    expect(trumpetFingering(84)).toEqual([]) //   C6  open
  })

  it('falls back to the pitch-class chart outside the tabulated range', () => {
    expect(trumpetFingering(90)).toEqual([2]) // 90 % 12 = 6 (F#) -> 2
  })
})

describe('valveFingering (per-instrument system)', () => {
  it('the trumpet system matches the octave-aware trumpet chart (euphonium T.C.)', () => {
    expect(valveFingering(62, 'trumpet')).toEqual([1, 3]) // D4
    expect(valveFingering(74, 'trumpet')).toEqual([1]) //    D5 (octave-aware)
  })

  it('the three-valve system is purely pitch-class based (no octave quirks)', () => {
    // low and high D both give the generic 1-3, unlike the trumpet chart
    expect(valveFingering(62, 'three-valve')).toEqual([1, 3])
    expect(valveFingering(74, 'three-valve')).toEqual([1, 3])
  })

  it('defaults to the trumpet system', () => {
    expect(valveFingering(74)).toEqual([1])
  })
})

describe('slidePosition (tenor trombone)', () => {
  it('puts the B♭ overtone series in 1st position', () => {
    expect(slidePosition(46)).toBe(1) // Bb2
    expect(slidePosition(53)).toBe(1) // F3
    expect(slidePosition(58)).toBe(1) // Bb3
    expect(slidePosition(62)).toBe(1) // D4
    expect(slidePosition(65)).toBe(1) // F4
  })

  it('matches the standard chart for the low register', () => {
    expect(slidePosition(45)).toBe(2) // A2  2nd
    expect(slidePosition(43)).toBe(4) // G2  4th
    expect(slidePosition(41)).toBe(6) // F2  6th
    expect(slidePosition(40)).toBe(7) // E2  7th
  })

  it('matches the standard chart around the bass staff', () => {
    expect(slidePosition(52)).toBe(2) // E3  2nd
    expect(slidePosition(60)).toBe(3) // C4  3rd
    expect(slidePosition(55)).toBe(4) // G3  4th
    expect(slidePosition(50)).toBe(4) // D3  4th
  })

  it('skips the out-of-tune 7th partial (Ab4 is 3rd via the Bb4 partial, not 1st)', () => {
    expect(slidePosition(68)).toBe(3) // Ab4
    expect(slidePosition(67)).toBe(4) // G4
    expect(slidePosition(70)).toBe(1) // Bb4
  })
})

describe('tubaFingering (BB♭, 3-valve, derived from the overtone series)', () => {
  it('opens on the B♭ overtone series', () => {
    expect(tubaFingering(46)).toEqual([]) // Bb2
    expect(tubaFingering(53)).toEqual([]) // F3
    expect(tubaFingering(58)).toEqual([]) // Bb3
    expect(tubaFingering(50)).toEqual([]) // D3
  })

  it('matches the standard BB♭ chart around the staff', () => {
    expect(tubaFingering(48)).toEqual([1]) //    C3  1st
    expect(tubaFingering(52)).toEqual([2]) //    E3  2nd
    expect(tubaFingering(55)).toEqual([1, 2]) // G3  1-2
    expect(tubaFingering(57)).toEqual([2]) //    A3  2nd
  })

  it('handles the low register (E2..D2)', () => {
    expect(tubaFingering(40)).toEqual([2]) //    E2  2nd
    expect(tubaFingering(41)).toEqual([]) //     F2  open
    expect(tubaFingering(39)).toEqual([1]) //    Eb2 1st
    expect(tubaFingering(38)).toEqual([1, 2]) // D2  1-2
  })
})

describe('absolutePitches', () => {
  it('assigns ascending MIDI starting in octave 4', () => {
    const notes = [{ semitone: 0 }, { semitone: 2 }, { semitone: 4 }] // C D E
    expect(absolutePitches(notes)).toEqual([60, 62, 64])
  })

  it('climbs an octave when the pitch class wraps (2-octave scale)', () => {
    // C major over two octaves: the second C..B lands an octave higher.
    const cmaj = [0, 2, 4, 5, 7, 9, 11]
    const twoOct = [...cmaj, ...cmaj].map((s) => ({ semitone: s }))
    const midis = absolutePitches(twoOct)
    expect(midis.slice(0, 7)).toEqual([60, 62, 64, 65, 67, 69, 71])
    expect(midis.slice(7)).toEqual([72, 74, 76, 77, 79, 81, 83])
    // the high D in the second octave is 74 -> 1st valve
    expect(trumpetFingering(midis[8])).toEqual([1])
  })
})
