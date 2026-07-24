import { describe, it, expect } from 'vitest'
import { keyboardKeys } from 'renderers/keyboard_renderer'

describe('keyboardKeys', () => {
  it('produces 12 keys per octave starting at C', () => {
    const keys = keyboardKeys({ octaves: 1, startNote: 'C' })
    expect(keys).toHaveLength(12)
    expect(keys[0].semitone).toBe(0)
    expect(keys[0].isBlack).toBe(false)
    expect(keys[1].semitone).toBe(1)
    expect(keys[1].isBlack).toBe(true)
  })

  it('spans multiple octaves', () => {
    const keys = keyboardKeys({ octaves: 2, startNote: 'C' })
    expect(keys).toHaveLength(24)
  })

  it('marks the 5 black keys per octave', () => {
    const keys = keyboardKeys({ octaves: 1, startNote: 'C' })
    expect(keys.filter((k) => k.isBlack)).toHaveLength(5)
  })

  it('assigns sequential white-key indices for layout', () => {
    const keys = keyboardKeys({ octaves: 1, startNote: 'C' })
    const whites = keys.filter((k) => !k.isBlack)
    expect(whites.map((k) => k.whiteIndex)).toEqual([0, 1, 2, 3, 4, 5, 6])
  })
})
