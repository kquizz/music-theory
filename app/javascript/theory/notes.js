export const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
export const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

const LOOKUP = {}
NOTES_SHARP.forEach((name, i) => { LOOKUP[name] = i })
NOTES_FLAT.forEach((name, i) => { LOOKUP[name] = i })

export function normalize(value) {
  return ((value % 12) + 12) % 12
}

export function noteToNumber(name) {
  const value = LOOKUP[name]
  if (value === undefined) throw new Error(`Unknown note: ${name}`)
  return value
}

export function numberToNote(value, accidental = 'sharp') {
  const names = accidental === 'flat' ? NOTES_FLAT : NOTES_SHARP
  return names[normalize(value)]
}
