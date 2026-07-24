import { normalize, numberToNote } from 'theory/notes'
import { scaleNotes, SCALES } from 'theory/scales'

// Standard triad qualities keyed by "third,fifth" intervals from the chord root.
const TRIAD_QUALITY = {
  '4,7': 'maj',
  '3,7': 'min',
  '3,6': 'dim',
  '4,8': 'aug',
}
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
const LABEL_SUFFIX = { maj: '', min: 'm', dim: 'dim', aug: 'aug' }
const ROMAN_SUFFIX = { maj: '', min: '', dim: '°', aug: '+' }

// The diatonic triads of a scale: one chord stacked in thirds on each scale degree.
// Only defined for 7-note scales (major/modes, harmonic & melodic minor, etc.);
// pentatonic/blues/symmetric scales return [] (no conventional diatonic harmony).
// Each entry: { degree, roman, quality, chordRoot, label }.
export function diatonicChords(root, scaleKey, accidental = 'sharp') {
  const scale = SCALES[scaleKey]
  if (!scale || scale.intervals.length !== 7) return []
  const notes = scaleNotes(root, scaleKey).map((n) => n.semitone)

  return notes.map((rootPc, i) => {
    const third = notes[(i + 2) % 7]
    const fifth = notes[(i + 4) % 7]
    const t = normalize(third - rootPc)
    const f = normalize(fifth - rootPc)
    const quality = TRIAD_QUALITY[`${t},${f}`] || (t <= 3 ? 'min' : 'maj')
    const upper = quality === 'maj' || quality === 'aug'
    const roman = (upper ? ROMAN[i] : ROMAN[i].toLowerCase()) + ROMAN_SUFFIX[quality]
    const chordRoot = numberToNote(rootPc, accidental)
    return { degree: i, roman, quality, chordRoot, label: chordRoot + LABEL_SUFFIX[quality] }
  })
}
