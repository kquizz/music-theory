import { diatonicChords } from 'theory/diatonic'
import { chordNotes } from 'theory/chords'

// Common progressions as scale-degree indices (0 = the tonic chord). They apply to
// any 7-note scale via its diatonic chords, so the roman-numeral labels adjust to
// the key automatically (I–V–vi–IV in C major becomes i–v–VI–IV in A minor).
export const PROGRESSIONS = [
  { name: 'Pop', degrees: [0, 4, 5, 3] }, //     I–V–vi–IV
  { name: 'Doo-wop', degrees: [0, 5, 3, 4] }, //  I–vi–IV–V
  { name: '50s', degrees: [0, 5, 1, 4] }, //      I–vi–ii–V
  { name: 'Classic', degrees: [0, 3, 4] }, //     I–IV–V
  { name: 'ii–V–I', degrees: [1, 4, 0] }, //      jazz cadence
]

// The chords of a progression in the given key: the diatonic chord at each degree,
// each carrying its playable `notes`. Empty for scales without diatonic harmony.
export function progressionChords(root, scaleKey, accidental, degrees) {
  const chords = diatonicChords(root, scaleKey, accidental)
  if (!chords.length) return []
  return degrees
    .map((d) => chords[d])
    .filter(Boolean)
    .map((ch) => ({ ...ch, notes: chordNotes(ch.chordRoot, ch.quality) }))
}
