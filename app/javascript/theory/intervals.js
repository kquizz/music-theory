import { normalize } from 'theory/notes'

// Interval labels relative to a root, by semitone distance (0..11).
const INTERVAL_LABELS = [
  'R', '♭2', '2', '♭3', '3', '4', '♭5', '5', '♭6', '6', '♭7', '7',
]

// The scale-degree / chord-function label for a note relative to a root
// (e.g. root=C, note=E -> "3"; note=B♭ -> "♭7").
export function intervalLabel(rootSemitone, noteSemitone) {
  return INTERVAL_LABELS[normalize(noteSemitone - rootSemitone)]
}
