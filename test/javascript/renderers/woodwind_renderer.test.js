import { describe, it, expect } from 'vitest'
import { saxFingering } from 'renderers/woodwind_renderer'

// Sorted comparison so key order doesn't matter.
const keys = (midi) => saxFingering(midi).slice().sort()

describe('saxFingering (written pitch)', () => {
  it('fingers the natural climb: D all six, lifting up to C/B', () => {
    expect(keys(62)).toEqual(['L1', 'L2', 'L3', 'R1', 'R2', 'R3'].sort()) // D4
    expect(keys(64)).toEqual(['L1', 'L2', 'L3', 'R1', 'R2'].sort()) //      E4
    expect(keys(65)).toEqual(['L1', 'L2', 'L3', 'R1'].sort()) //            F4
    expect(keys(67)).toEqual(['L1', 'L2', 'L3'].sort()) //                  G4
    expect(keys(69)).toEqual(['L1', 'L2'].sort()) //                        A4
    expect(keys(71)).toEqual(['L1']) //                                     B4
    expect(keys(72)).toEqual(['L2']) //                                     C5 (odd one)
  })

  it('uses the standard chromatic fingerings', () => {
    expect(keys(66)).toEqual(['L1', 'L2', 'L3', 'R2'].sort()) //  F#4 forked
    expect(keys(68)).toEqual(['Gs', 'L1', 'L2', 'L3'].sort()) //  G#4 (G# key)
    expect(keys(70)).toEqual(['L1', 'L2', 'bis'].sort()) //       Bb4 (bis)
    expect(keys(63)).toEqual(['Eb', 'L1', 'L2', 'L3', 'R1', 'R2', 'R3'].sort()) // Eb4
    expect(saxFingering(61)).toEqual([]) //                       C#5 all open
  })

  it('adds the octave key in the upper register (from written D5)', () => {
    expect(keys(73)).toEqual([]) //           C#5 still open, no octave key
    expect(keys(74)).toContain('oct') //      D5 = D fingering + octave key
    expect(keys(74).filter((k) => k !== 'oct').sort())
      .toEqual(['L1', 'L2', 'L3', 'R1', 'R2', 'R3'].sort())
  })
})
