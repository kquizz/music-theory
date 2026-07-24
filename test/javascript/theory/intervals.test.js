import { describe, it, expect } from 'vitest'
import { intervalLabel } from 'theory/intervals'

describe('intervalLabel', () => {
  it('labels intervals from the root', () => {
    expect(intervalLabel(0, 0)).toBe('R') // C -> C
    expect(intervalLabel(0, 4)).toBe('3') // C -> E
    expect(intervalLabel(0, 7)).toBe('5') // C -> G
    expect(intervalLabel(0, 10)).toBe('♭7') // C -> Bb
  })

  it('wraps across the octave', () => {
    expect(intervalLabel(9, 0)).toBe('♭3') // A -> C is a minor third
    expect(intervalLabel(7, 2)).toBe('5') // G -> D
  })
})
