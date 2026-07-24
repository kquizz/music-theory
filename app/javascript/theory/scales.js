import { noteToNumber, normalize } from 'theory/notes'

// Keys are URL-safe and non-integer (integer keys would reorder in the dropdown).
// `alias: true` entries resolve but are hidden from the dropdown (they duplicate
// another entry's display name).
export const SCALES = {
  major: { name: 'Major (Ionian)', intervals: [0, 2, 4, 5, 7, 9, 11] },
  dorian: { name: 'Dorian', intervals: [0, 2, 3, 5, 7, 9, 10] },
  phrygian: { name: 'Phrygian', intervals: [0, 1, 3, 5, 7, 8, 10] },
  lydian: { name: 'Lydian', intervals: [0, 2, 4, 6, 7, 9, 11] },
  mixolydian: { name: 'Mixolydian', intervals: [0, 2, 4, 5, 7, 9, 10] },
  aeolian: { name: 'Minor (Aeolian)', intervals: [0, 2, 3, 5, 7, 8, 10] },
  minor: { name: 'Minor (Aeolian)', intervals: [0, 2, 3, 5, 7, 8, 10], alias: true },
  locrian: { name: 'Locrian', intervals: [0, 1, 3, 5, 6, 8, 10] },
  major_pentatonic: { name: 'Major Pentatonic', intervals: [0, 2, 4, 7, 9] },
  minor_pentatonic: { name: 'Minor Pentatonic', intervals: [0, 3, 5, 7, 10] },
  blues: { name: 'Blues (Minor)', intervals: [0, 3, 5, 6, 7, 10] },
  major_blues: { name: 'Blues (Major)', intervals: [0, 2, 3, 4, 7, 9] },
  harmonic_minor: { name: 'Harmonic Minor', intervals: [0, 2, 3, 5, 7, 8, 11] },
  melodic_minor: { name: 'Melodic Minor', intervals: [0, 2, 3, 5, 7, 9, 11] },
  phrygian_dominant: { name: 'Phrygian Dominant', intervals: [0, 1, 4, 5, 7, 8, 10] },
  lydian_dominant: { name: 'Lydian Dominant', intervals: [0, 2, 4, 6, 7, 9, 10] },
  altered: { name: 'Altered (Super Locrian)', intervals: [0, 1, 3, 4, 6, 8, 10] },
  whole_tone: { name: 'Whole Tone', intervals: [0, 2, 4, 6, 8, 10] },
  diminished_wh: { name: 'Diminished (Whole-Half)', intervals: [0, 2, 3, 5, 6, 8, 9, 11] },
  diminished_hw: { name: 'Diminished (Half-Whole)', intervals: [0, 1, 3, 4, 6, 7, 9, 10] },
  hungarian_minor: { name: 'Hungarian Minor', intervals: [0, 2, 3, 6, 7, 8, 11] },
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
