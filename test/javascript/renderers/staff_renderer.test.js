import { describe, it, expect } from 'vitest'
import { staffPlacement } from 'renderers/staff_renderer'

describe('staffPlacement', () => {
  it('places natural notes by letter step (C=0..B=6)', () => {
    expect(staffPlacement('C')).toEqual({ letter: 'C', step: 0, accidental: '' })
    expect(staffPlacement('E')).toEqual({ letter: 'E', step: 2, accidental: '' })
    expect(staffPlacement('B')).toEqual({ letter: 'B', step: 6, accidental: '' })
  })

  it('splits sharps into letter + accidental', () => {
    expect(staffPlacement('F#')).toEqual({ letter: 'F', step: 3, accidental: '#' })
  })

  it('splits flats into letter + accidental', () => {
    expect(staffPlacement('Bb')).toEqual({ letter: 'B', step: 6, accidental: 'b' })
  })
})
