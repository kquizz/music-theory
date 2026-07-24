import { describe, it, expect } from 'vitest'
import { defaultAccidental } from 'theory/spelling'

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
