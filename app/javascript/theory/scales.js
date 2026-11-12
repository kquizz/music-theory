import { noteToNumber, normalize } from 'theory/notes'

// Keys are URL-safe and non-integer (integer keys would reorder in the dropdown).
// `alias: true` entries resolve but are hidden from the dropdown (they duplicate
// another entry's display name).
export const SCALES = {
  major: { name: 'Major (Ionian)', formula: 'The basic do-re-mi scale', intervals: [0, 2, 4, 5, 7, 9, 11] },
  dorian: { name: 'Dorian', formula: 'Natural minor with a raised 6th (♮6)', intervals: [0, 2, 3, 5, 7, 9, 10] },
  phrygian: { name: 'Phrygian', formula: 'Natural minor with a ♭2', intervals: [0, 1, 3, 5, 7, 8, 10] },
  lydian: { name: 'Lydian', formula: 'Major with a ♯4', intervals: [0, 2, 4, 6, 7, 9, 11] },
  mixolydian: { name: 'Mixolydian', formula: 'Major with a ♭7', intervals: [0, 2, 4, 5, 7, 9, 10] },
  aeolian: { name: 'Minor (Aeolian)', formula: 'Major with ♭3, ♭6, ♭7', intervals: [0, 2, 3, 5, 7, 8, 10] },
  minor: { name: 'Minor (Aeolian)', formula: 'Major with ♭3, ♭6, ♭7', intervals: [0, 2, 3, 5, 7, 8, 10], alias: true },
  locrian: { name: 'Locrian', formula: 'Natural minor with ♭2 and ♭5', intervals: [0, 1, 3, 5, 6, 8, 10] },
  major_pentatonic: { name: 'Major Pentatonic', formula: 'Major scale minus the 4th and 7th', intervals: [0, 2, 4, 7, 9] },
  minor_pentatonic: { name: 'Minor Pentatonic', formula: 'Natural minor minus the 2nd and 6th', intervals: [0, 3, 5, 7, 10] },
  blues: { name: 'Blues (Minor)', formula: 'Minor pentatonic + ♭5 (the blue note)', intervals: [0, 3, 5, 6, 7, 10] },
  major_blues: { name: 'Blues (Major)', formula: 'Major pentatonic + ♭3 (the blue note)', intervals: [0, 2, 3, 4, 7, 9] },
  harmonic_minor: { name: 'Harmonic Minor', formula: 'Natural minor with a raised 7th', intervals: [0, 2, 3, 5, 7, 8, 11] },
  melodic_minor: { name: 'Melodic Minor', formula: 'Major with a ♭3', intervals: [0, 2, 3, 5, 7, 9, 11] },
  phrygian_dominant: { name: 'Phrygian Dominant', formula: '5th mode of harmonic minor (Phrygian with a major 3rd)', intervals: [0, 1, 4, 5, 7, 8, 10] },
  lydian_dominant: { name: 'Lydian Dominant', formula: 'Lydian with a ♭7 (4th mode of melodic minor)', intervals: [0, 2, 4, 6, 7, 9, 10] },
  altered: { name: 'Altered (Super Locrian)', formula: '7th mode of melodic minor — every tension altered', intervals: [0, 1, 3, 4, 6, 8, 10] },
  whole_tone: { name: 'Whole Tone', formula: 'All whole steps — six notes, no half steps', intervals: [0, 2, 4, 6, 8, 10] },
  diminished_wh: { name: 'Diminished (Whole-Half)', formula: 'Alternating whole, half steps', intervals: [0, 2, 3, 5, 6, 8, 9, 11] },
  diminished_hw: { name: 'Diminished (Half-Whole)', formula: 'Alternating half, whole steps', intervals: [0, 1, 3, 4, 6, 7, 9, 10] },
  hungarian_minor: { name: 'Hungarian Minor', formula: 'Harmonic minor with a ♯4', intervals: [0, 2, 3, 6, 7, 8, 11] },
}

export function scaleNotes(root, scaleKey) {
  const scale = SCALES[scaleKey]
  if (!scale) throw new Error(`Unknown scale: ${scaleKey}`)
  const rootNumber = noteToNumber(root)
  return scale.intervals.map((interval, degree) => ({
    semitone: normalize(rootNumber + interval),
    degree,
  }))
}

const STEP_NAMES = { 1: 'H', 2: 'W', 3: 'W+H', 4: '2W' }

// Pure: the whole/half-step pattern, e.g. major -> "W W H W W W H". Includes the
// final step back up to the octave.
export function stepPattern(intervals) {
  return intervals
    .map((n, i) => (i + 1 < intervals.length ? intervals[i + 1] : 12) - n)
    .map((d) => STEP_NAMES[d] || String(d))
    .join(' ')
}
