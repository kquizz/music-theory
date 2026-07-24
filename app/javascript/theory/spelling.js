import { noteToNumber } from 'theory/notes'

// By pitch class, whether the MAJOR key on that root is conventionally written
// with sharps or flats. C is neutral (no accidentals) → treated as sharp.
// For the ambiguous enharmonic keys we pick the common spelling:
// Db (not C#), F# (not Gb), B (not Cb).
const MAJOR_ACCIDENTAL = [
  'sharp', // 0  C
  'flat', //  1  Db
  'sharp', // 2  D
  'flat', //  3  Eb
  'sharp', // 4  E
  'flat', //  5  F
  'sharp', // 6  F#
  'sharp', // 7  G
  'flat', //  8  Ab
  'sharp', // 9  A
  'flat', //  10 Bb
  'sharp', // 11 B
]

const MINOR_SCALES = new Set([
  'dorian', 'phrygian', 'aeolian', 'minor', 'locrian',
  'minor_pentatonic', 'blues', 'harmonic_minor', 'melodic_minor', 'hungarian_minor',
])
const MINOR_CHORDS = new Set(['min', 'm6', 'm7', 'mmaj7', 'm9', 'dim', 'dim7', 'm7b5'])

function isMinorFamily(mode, name) {
  if (mode === 'scale') return MINOR_SCALES.has(name)
  if (mode === 'chord') return MINOR_CHORDS.has(name)
  return false
}

// Default accidental spelling for a view. Minor-family roots borrow their
// relative major (root + 3 semitones) key signature.
export function defaultAccidental({ mode, root, name }) {
  const rootPc = noteToNumber(root)
  const pc = isMinorFamily(mode, name) ? (rootPc + 3) % 12 : rootPc
  return MAJOR_ACCIDENTAL[pc]
}
