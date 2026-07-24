import { describe, it, expect } from 'vitest'
import { staffPlacement, ascendingPlacements } from 'renderers/staff_renderer'

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

describe('ascendingPlacements', () => {
  it('voices a chord upward so it climbs the staff (G minor: G Bb D)', () => {
    const abs = ascendingPlacements(['G', 'Bb', 'D']).map((p) => p.abs)
    expect(abs).toEqual([4, 6, 8]) // G4, Bb4, D5 — strictly ascending
  })

  it('places a C major triad as C4 (ledger) E4 G4', () => {
    const abs = ascendingPlacements(['C', 'E', 'G']).map((p) => p.abs)
    expect(abs).toEqual([0, 2, 4])
  })

  it('keeps a one-octave scale within a single octave', () => {
    const abs = ascendingPlacements(['C', 'D', 'E', 'F', 'G', 'A', 'B']).map((p) => p.abs)
    expect(abs).toEqual([0, 1, 2, 3, 4, 5, 6])
  })

  it('always produces a strictly ascending sequence', () => {
    const abs = ascendingPlacements(['A', 'C', 'E', 'G']).map((p) => p.abs)
    for (let i = 1; i < abs.length; i++) expect(abs[i]).toBeGreaterThan(abs[i - 1])
  })

  it('carries the accidental glyph through', () => {
    const p = ascendingPlacements(['G', 'Bb', 'D'])
    expect(p[1].accidental).toBe('b')
  })
})
