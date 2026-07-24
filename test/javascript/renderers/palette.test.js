import { describe, it, expect } from 'vitest'
import { colorForDegree, ROOT_COLOR } from 'renderers/palette'

describe('colorForDegree', () => {
  it('returns the root color for degree 0', () => {
    expect(colorForDegree(0)).toBe(ROOT_COLOR)
  })

  it('is stable and wraps past the palette length', () => {
    expect(colorForDegree(1)).toBe(colorForDegree(1))
    expect(colorForDegree(12)).toBe(colorForDegree(0))
  })

  it('always returns a hex color string', () => {
    for (let d = 0; d < 15; d++) expect(colorForDegree(d)).toMatch(/^#[0-9A-Fa-f]{6}$/)
  })
})
