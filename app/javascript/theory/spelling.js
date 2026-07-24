import { noteToNumber, numberToNote, normalize } from 'theory/notes'

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

// Whether the current view represents a minor key (for circle-of-fifths highlighting).
export function isMinorKey({ mode, name }) {
  return isMinorFamily(mode, name)
}

// Semitones from a mode's tonic up to its parent major key's tonic. A mode shares
// the key signature of this major key (e.g. C Mixolydian -> F major, 1 flat).
const PARENT_OFFSET = {
  major: 0, lydian: 7, mixolydian: 5, dorian: 10, aeolian: 3, minor: 3, phrygian: 8, locrian: 1,
}

// The (sharp-spelled) root of the major key whose signature this scale uses. For
// non-diatonic scales / chords with no clean parent, falls back to the tonic.
export function parentMajorRoot({ mode, root, name }) {
  const offset = mode === 'scale' && PARENT_OFFSET[name] != null ? PARENT_OFFSET[name] : 0
  return numberToNote(normalize(noteToNumber(root) + offset), 'sharp')
}

// Default accidental spelling for a view. Scales/modes borrow their parent major
// key's signature (so C Mixolydian → F major → flats, i.e. B♭ not A♯). Chords use
// the root's major key, or its relative major (root + 3) for minor-family chords.
export function defaultAccidental({ mode, root, name }) {
  if (mode === 'scale') {
    return MAJOR_ACCIDENTAL[noteToNumber(parentMajorRoot({ mode, root, name }))]
  }
  const rootPc = noteToNumber(root)
  const pc = isMinorFamily(mode, name) ? normalize(rootPc + 3) : rootPc
  return MAJOR_ACCIDENTAL[pc]
}
