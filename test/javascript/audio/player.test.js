import { describe, it, expect } from 'vitest'
import { midiToFreq, ascendingMidi } from 'audio/player'

describe('midiToFreq', () => {
  it('maps A4 to 440 Hz and octaves to 2x', () => {
    expect(midiToFreq(69)).toBeCloseTo(440, 5)
    expect(midiToFreq(57)).toBeCloseTo(220, 5) // A3
    expect(midiToFreq(81)).toBeCloseTo(880, 5) // A5
  })

  it('maps middle C (60) to ~261.63 Hz', () => {
    expect(midiToFreq(60)).toBeCloseTo(261.63, 2)
  })
})

describe('ascendingMidi', () => {
  const set = (semis) => semis.map((semitone, degree) => ({ semitone, degree }))

  it('places a C-major scale ascending from C4', () => {
    expect(ascendingMidi(set([0, 2, 4, 5, 7, 9, 11]))).toEqual([60, 62, 64, 65, 67, 69, 71])
  })

  it('keeps climbing when pitch classes wrap past the octave', () => {
    // A B C D — the C and D belong to the next octave, not below A
    expect(ascendingMidi(set([9, 11, 0, 2]))).toEqual([69, 71, 72, 74])
  })

  it('respects a custom base octave', () => {
    expect(ascendingMidi(set([0, 4, 7]), 48)).toEqual([48, 52, 55]) // C3 major triad
  })
})
