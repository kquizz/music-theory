import { describe, it, expect } from 'vitest'
import { noteToNumber, numberToNote, normalize, NOTES_SHARP, NOTES_FLAT } from 'theory/notes'

describe('notes', () => {
  it('maps sharp names to numbers', () => {
    expect(noteToNumber('C')).toBe(0)
    expect(noteToNumber('A')).toBe(9)
    expect(noteToNumber('A#')).toBe(10)
    expect(noteToNumber('B')).toBe(11)
  })

  it('maps flat names to the same numbers', () => {
    expect(noteToNumber('Bb')).toBe(10)
    expect(noteToNumber('Db')).toBe(1)
    expect(noteToNumber('Gb')).toBe(6)
  })

  it('throws on unknown note', () => {
    expect(() => noteToNumber('H')).toThrow()
  })

  it('renders numbers as names by accidental preference', () => {
    expect(numberToNote(10, 'sharp')).toBe('A#')
    expect(numberToNote(10, 'flat')).toBe('Bb')
    expect(numberToNote(0)).toBe('C')
  })

  it('normalizes/wraps note numbers into 0..11', () => {
    expect(normalize(12)).toBe(0)
    expect(normalize(-1)).toBe(11)
    expect(numberToNote(12)).toBe('C')
  })

  it('exposes 12-entry name arrays', () => {
    expect(NOTES_SHARP).toHaveLength(12)
    expect(NOTES_FLAT).toHaveLength(12)
  })
})
