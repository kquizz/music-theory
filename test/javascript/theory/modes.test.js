import { describe, it, expect } from 'vitest'
import { relativeModes } from 'theory/modes'
import { numberToNote } from 'theory/notes'

const names = (root, key) => relativeModes(root, key).map((m) => `${numberToNote(m.pc)} ${m.name}`)

describe('relativeModes', () => {
  it('lists the modes of G major from G Ionian', () => {
    expect(names('G', 'major')).toEqual([
      'G Ionian', 'A Dorian', 'B Phrygian', 'C Lydian', 'D Mixolydian', 'E Aeolian', 'F# Locrian',
    ])
  })

  it('finds the same set starting from any of its modes', () => {
    expect(names('A', 'dorian')).toEqual(names('G', 'major'))
    expect(names('E', 'minor')).toEqual(names('G', 'major'))
  })

  it('puts F Dorian in E-flat major', () => {
    expect(names('F', 'dorian')[0]).toBe('D# Ionian')
  })

  it('is empty for non-diatonic scales', () => {
    expect(relativeModes('C', 'blues')).toEqual([])
  })
})
