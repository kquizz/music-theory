import { describe, it, expect } from 'vitest'
import { diatonicChords } from 'theory/diatonic'

const romans = (chords) => chords.map((c) => c.roman)
const labels = (chords) => chords.map((c) => c.label)

describe('diatonicChords', () => {
  it('builds the seven triads of C major', () => {
    const chords = diatonicChords('C', 'major')
    expect(romans(chords)).toEqual(['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'])
    expect(labels(chords)).toEqual(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'])
  })

  it('handles harmonic minor (augmented III+, two diminished)', () => {
    const chords = diatonicChords('A', 'harmonic_minor')
    expect(romans(chords)).toEqual(['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'])
    expect(labels(chords)).toEqual(['Am', 'Bdim', 'Caug', 'Dm', 'E', 'F', 'G#dim'])
  })

  it('follows the chosen accidental spelling', () => {
    const chords = diatonicChords('F', 'major', 'flat')
    expect(labels(chords)).toEqual(['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim'])
  })

  it('returns nothing for non-7-note scales', () => {
    expect(diatonicChords('C', 'major_pentatonic')).toEqual([])
    expect(diatonicChords('C', 'blues')).toEqual([])
    expect(diatonicChords('C', 'whole_tone')).toEqual([])
  })
})
