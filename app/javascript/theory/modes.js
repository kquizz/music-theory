import { noteToNumber, normalize } from 'theory/notes'

// The seven diatonic modes in order: mode N starts on note N of its parent
// major scale, so they all share that scale's notes and key signature.
export const MODES = [
  { key: 'major', name: 'Ionian' },
  { key: 'dorian', name: 'Dorian' },
  { key: 'phrygian', name: 'Phrygian' },
  { key: 'lydian', name: 'Lydian' },
  { key: 'mixolydian', name: 'Mixolydian' },
  { key: 'aeolian', name: 'Aeolian' },
  { key: 'locrian', name: 'Locrian' },
]

const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11]

// Pure: the seven modes that share this mode's notes, as { key, name, pc }
// (pc = that mode's root pitch class). Empty for non-diatonic scales.
export function relativeModes(root, scaleKey) {
  const key = scaleKey === 'minor' ? 'aeolian' : scaleKey
  const degree = MODES.findIndex((m) => m.key === key)
  if (degree < 0) return []
  const parentPc = normalize(noteToNumber(root) - MAJOR_STEPS[degree])
  return MODES.map((m, i) => ({ ...m, pc: normalize(parentPc + MAJOR_STEPS[i]) }))
}
