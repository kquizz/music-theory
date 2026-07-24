import { describe, it, expect } from 'vitest'
import { noteSet } from 'theory/note_set'

describe('noteSet', () => {
  it('scale mode delegates to scaleNotes', () => {
    const result = noteSet({ mode: 'scale', root: 'C', name: 'major' })
    expect(result.map((n) => n.semitone)).toEqual([0, 2, 4, 5, 7, 9, 11])
  })

  it('chord mode delegates to chordNotes', () => {
    const result = noteSet({ mode: 'chord', root: 'C', name: 'maj7' })
    expect(result.map((n) => n.semitone)).toEqual([0, 4, 7, 11])
  })

  it('notes mode returns all 12 semitones from the root, degree by distance', () => {
    const result = noteSet({ mode: 'notes', root: 'C' })
    expect(result.map((n) => n.semitone)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    expect(result.map((n) => n.degree)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
  })

  it('throws on unknown mode', () => {
    expect(() => noteSet({ mode: 'bogus', root: 'C' })).toThrow()
  })
})
