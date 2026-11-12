import { describe, it, expect } from 'vitest'
import {
  pcAt, cellOf, TRIADS, triadAt, triadName, triadMidis, neighbors, fifthsPath, noteName,
} from 'theory/tonnetz'

describe('tonnetz grid', () => {
  it('places every pitch class exactly once', () => {
    const seen = []
    for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) seen.push(pcAt(i, j))
    expect([...seen].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
  })

  it('wraps indices and inverts with cellOf', () => {
    expect(pcAt(3, 4)).toBe(pcAt(0, 0))
    expect(pcAt(-1, -1)).toBe(pcAt(2, 3))
    for (let pc = 0; pc < 12; pc++) expect(pcAt(...cellOf(pc))).toBe(pc)
  })

  it('steps by major thirds along i and minor thirds along j', () => {
    expect(pcAt(1, 0)).toBe(4)
    expect(pcAt(0, 1)).toBe(3)
    expect(pcAt(1, 1)).toBe(7)
  })
})

describe('tonnetz triads', () => {
  it('has 12 major and 12 minor distinct triads', () => {
    expect(TRIADS).toHaveLength(24)
    expect(TRIADS.filter((t) => t.quality === 'major')).toHaveLength(12)
    expect(TRIADS.filter((t) => t.quality === 'minor')).toHaveLength(12)
    const keys = new Set(TRIADS.map((t) => `${t.quality}:${[...t.pcs].sort((a, b) => a - b)}`))
    expect(keys.size).toBe(24)
  })

  it('builds correct triad notes', () => {
    expect(triadAt(0, 'major').pcs.slice().sort((a, b) => a - b)).toEqual([0, 4, 7])
    expect(triadAt(0, 'minor').pcs.slice().sort((a, b) => a - b)).toEqual([0, 3, 7])
    expect(triadAt(9, 'minor').pcs.slice().sort((a, b) => a - b)).toEqual([0, 4, 9])
    expect(triadName(triadAt(3, 'major'))).toBe('E♭ major')
    expect(triadMidis(triadAt(0, 'major'))).toEqual([60, 64, 67])
  })

  it('every triad has three neighbors sharing two notes, of opposite quality', () => {
    for (const t of TRIADS) {
      const ns = neighbors(t)
      expect(ns.map((n) => n.relation)).toEqual(['relative', 'parallel', 'leading-tone'])
      for (const n of ns) {
        expect(n.triad.quality).not.toBe(t.quality)
        expect(n.shared).toHaveLength(2)
      }
    }
  })

  it('C major neighbors are A minor, C minor, E minor', () => {
    const ns = neighbors(triadAt(0, 'major'))
    expect(ns.map((n) => [n.relation, triadName(n.triad)])).toEqual([
      ['relative', 'A minor'],
      ['parallel', 'C minor'],
      ['leading-tone', 'E minor'],
    ])
    expect(ns[0].shared.slice().sort((a, b) => a - b)).toEqual([0, 4]) // C, E
    expect(ns[1].shared.slice().sort((a, b) => a - b)).toEqual([0, 7]) // C, G
    expect(ns[2].shared.slice().sort((a, b) => a - b)).toEqual([4, 7]) // E, G
  })

  it('neighbor relation is symmetric', () => {
    for (const t of TRIADS) {
      for (const n of neighbors(t)) {
        const back = neighbors(n.triad).find((b) => b.triad === t)
        expect(back?.relation).toBe(n.relation)
      }
    }
  })
})

describe('fifths path', () => {
  it('visits all 12 notes in circle-of-fifths order and closes', () => {
    const path = fifthsPath()
    expect(path.map((p) => noteName(p.pc))).toEqual(
      ['C', 'G', 'D', 'A', 'E', 'B', 'F♯', 'C♯', 'A♭', 'E♭', 'B♭', 'F'],
    )
    expect(new Set(path.map((p) => p.pc)).size).toBe(12)
    // The step after the last returns to C.
    expect(pcAt(12, 12)).toBe(path[0].pc)
  })

  it('moves along the diagonal (i+1, j+1) each step', () => {
    const path = fifthsPath()
    for (let k = 0; k < 11; k++) {
      expect(path[k + 1].i).toBe((path[k].i + 1) % 3)
      expect(path[k + 1].j).toBe((path[k].j + 1) % 4)
    }
  })
})
