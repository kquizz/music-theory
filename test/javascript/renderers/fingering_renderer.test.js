import { describe, it, expect } from 'vitest'
import { trumpetFingering, absolutePitches } from 'renderers/fingering_renderer'

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
