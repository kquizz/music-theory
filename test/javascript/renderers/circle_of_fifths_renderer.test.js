import { describe, it, expect } from 'vitest'
import { CIRCLE, indexFromAngle, hitTest } from 'renderers/circle_of_fifths_renderer'

describe('circle of fifths data', () => {
  it('has 12 keys in fifths order starting at C', () => {
    expect(CIRCLE).toHaveLength(12)
    expect(CIRCLE.map((e) => e.root)).toEqual(
      ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'],
    )
  })

  it('pairs each major with its relative minor (root - 3 semitones-ish)', () => {
    expect(CIRCLE[0]).toMatchObject({ major: 'C', minor: 'Am', minorRoot: 'A' })
    expect(CIRCLE[1]).toMatchObject({ major: 'G', minor: 'Em', minorRoot: 'E' })
  })

  it('shows key signatures', () => {
    expect(CIRCLE[0].sig).toBe('') // C
    expect(CIRCLE[2].sig).toBe('2♯') // D
    expect(CIRCLE[11].sig).toBe('1♭') // F
  })
})

describe('indexFromAngle', () => {
  it('maps clockwise-from-top angle to circle index', () => {
    expect(indexFromAngle(0)).toBe(0) // top = C
    expect(indexFromAngle((Math.PI * 2) / 12)).toBe(1) // one step CW = G
    expect(indexFromAngle(Math.PI)).toBe(6) // opposite = Gb/F#
  })
})

describe('hitTest', () => {
  it('selects the major key on the outer ring at the top (C)', () => {
    const hit = hitTest(0, -100) // outer ring (80..120)
    expect(hit.entry.root).toBe('C')
    expect(hit.isMinor).toBe(false)
  })

  it('selects the relative minor on the inner ring', () => {
    const hit = hitTest(0, -55) // inner ring (34..80)
    expect(hit.entry.minorRoot).toBe('A')
    expect(hit.isMinor).toBe(true)
  })

  it('returns null outside the ring', () => {
    expect(hitTest(0, -200)).toBeNull()
    expect(hitTest(0, 0)).toBeNull()
  })
})
