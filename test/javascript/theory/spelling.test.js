import { describe, it, expect } from 'vitest'
import { defaultAccidental, keySignature } from 'theory/spelling'

describe('defaultAccidental', () => {
  it('uses sharps for sharp-side major keys/chords', () => {
    expect(defaultAccidental({ mode: 'scale', root: 'G', name: 'major' })).toBe('sharp')
    expect(defaultAccidental({ mode: 'scale', root: 'D', name: 'major' })).toBe('sharp')
    expect(defaultAccidental({ mode: 'chord', root: 'A', name: 'maj' })).toBe('sharp')
  })

  it('uses flats for flat-side major keys/chords', () => {
    expect(defaultAccidental({ mode: 'scale', root: 'F', name: 'major' })).toBe('flat')
    expect(defaultAccidental({ mode: 'chord', root: 'Bb', name: 'maj' })).toBe('flat')
    expect(defaultAccidental({ mode: 'chord', root: 'Eb', name: 'maj7' })).toBe('flat')
  })

  it('spells minor via the relative major (root + 3 semitones)', () => {
    // G minor -> relative major Bb -> flats (the reported bug)
    expect(defaultAccidental({ mode: 'chord', root: 'G', name: 'min' })).toBe('flat')
    expect(defaultAccidental({ mode: 'scale', root: 'G', name: 'minor' })).toBe('flat')
    // D minor -> relative major F -> flats
    expect(defaultAccidental({ mode: 'chord', root: 'D', name: 'min' })).toBe('flat')
    // E minor -> relative major G -> sharps
    expect(defaultAccidental({ mode: 'chord', root: 'E', name: 'min' })).toBe('sharp')
    // A minor -> relative major C -> neutral (sharp)
    expect(defaultAccidental({ mode: 'scale', root: 'A', name: 'aeolian' })).toBe('sharp')
  })

  it('treats diminished/half-diminished as minor-family', () => {
    // B dim -> minor family -> (B=11 +3 = 2 = D major) -> sharp
    expect(defaultAccidental({ mode: 'chord', root: 'B', name: 'dim' })).toBe('sharp')
  })

  it('notes mode uses the root major key spelling', () => {
    expect(defaultAccidental({ mode: 'notes', root: 'F', name: '' })).toBe('flat')
    expect(defaultAccidental({ mode: 'notes', root: 'G', name: '' })).toBe('sharp')
  })
})

describe('keySignature', () => {
  it('C major has no accidentals', () => {
    expect(keySignature({ mode: 'scale', root: 'C', name: 'major' })).toEqual({ type: 'sharp', letters: [] })
  })

  it('sharp keys list sharps in order', () => {
    expect(keySignature({ mode: 'scale', root: 'G', name: 'major' })).toEqual({ type: 'sharp', letters: ['F'] })
    expect(keySignature({ mode: 'scale', root: 'E', name: 'major' }))
      .toEqual({ type: 'sharp', letters: ['F', 'C', 'G', 'D'] })
  })

  it('flat keys list flats in order', () => {
    expect(keySignature({ mode: 'scale', root: 'F', name: 'major' })).toEqual({ type: 'flat', letters: ['B'] })
    expect(keySignature({ mode: 'scale', root: 'Eb', name: 'major' }))
      .toEqual({ type: 'flat', letters: ['B', 'E', 'A'] })
  })

  it('modes borrow their parent major key signature', () => {
    // C Mixolydian -> F major (1 flat)
    expect(keySignature({ mode: 'scale', root: 'C', name: 'mixolydian' })).toEqual({ type: 'flat', letters: ['B'] })
    // A Aeolian -> C major (none)
    expect(keySignature({ mode: 'scale', root: 'A', name: 'aeolian' })).toEqual({ type: 'sharp', letters: [] })
    // E Dorian -> D major (2 sharps)
    expect(keySignature({ mode: 'scale', root: 'E', name: 'dorian' }))
      .toEqual({ type: 'sharp', letters: ['F', 'C'] })
  })

  it('chords, notes, and non-diatonic scales carry no signature', () => {
    expect(keySignature({ mode: 'chord', root: 'G', name: 'maj7' })).toEqual({ type: 'sharp', letters: [] })
    expect(keySignature({ mode: 'notes', root: 'F', name: '' })).toEqual({ type: 'sharp', letters: [] })
    expect(keySignature({ mode: 'scale', root: 'C', name: 'blues' })).toEqual({ type: 'sharp', letters: [] })
  })
})
