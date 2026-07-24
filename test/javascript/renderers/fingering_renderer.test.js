import { describe, it, expect } from 'vitest'
import { threeValveFingering } from 'renderers/fingering_renderer'

describe('threeValveFingering', () => {
  it('matches the standard three-valve brass chart by pitch class', () => {
    expect(threeValveFingering(0)).toEqual([]) //        C  open
    expect(threeValveFingering(1)).toEqual([1, 2, 3]) // Db
    expect(threeValveFingering(2)).toEqual([1, 3]) //    D
    expect(threeValveFingering(3)).toEqual([2, 3]) //    Eb
    expect(threeValveFingering(4)).toEqual([1, 2]) //    E
    expect(threeValveFingering(5)).toEqual([1]) //       F
    expect(threeValveFingering(6)).toEqual([2]) //       Gb
    expect(threeValveFingering(7)).toEqual([]) //        G  open
    expect(threeValveFingering(8)).toEqual([2, 3]) //    Ab
    expect(threeValveFingering(9)).toEqual([1, 2]) //    A
    expect(threeValveFingering(10)).toEqual([1]) //      Bb
    expect(threeValveFingering(11)).toEqual([2]) //      B
  })

  it('wraps pitch classes outside 0..11', () => {
    expect(threeValveFingering(12)).toEqual([]) // C
    expect(threeValveFingering(14)).toEqual([1, 3]) // D
  })

  it('fingers a written D as valves 1-3', () => {
    expect(threeValveFingering(2)).toEqual([1, 3])
  })
})
