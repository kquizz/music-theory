import { noteToNumber, normalize } from 'theory/notes'

// Keys are URL-safe and non-integer (integer keys like "6"/"7" would reorder in
// the dropdown). Extended chords use compound intervals (9th = 14, etc.);
// normalize() folds them into pitch classes for the fretboard/keyboard, and the
// staff re-voices them upward.
export const CHORDS = {
  maj: { name: 'Major', intervals: [0, 4, 7] },
  min: { name: 'Minor', intervals: [0, 3, 7] },
  dim: { name: 'Diminished', intervals: [0, 3, 6] },
  aug: { name: 'Augmented', intervals: [0, 4, 8] },
  sus2: { name: 'Sus2', intervals: [0, 2, 7] },
  sus4: { name: 'Sus4', intervals: [0, 5, 7] },
  power5: { name: 'Power (5)', intervals: [0, 7] },
  maj6: { name: 'Major 6', intervals: [0, 4, 7, 9] },
  m6: { name: 'Minor 6', intervals: [0, 3, 7, 9] },
  sixnine: { name: '6/9', intervals: [0, 4, 7, 9, 14] },
  maj7: { name: 'Major 7', intervals: [0, 4, 7, 11] },
  dom7: { name: 'Dominant 7', intervals: [0, 4, 7, 10] },
  m7: { name: 'Minor 7', intervals: [0, 3, 7, 10] },
  mmaj7: { name: 'Minor (Major 7)', intervals: [0, 3, 7, 11] },
  dim7: { name: 'Diminished 7', intervals: [0, 3, 6, 9] },
  m7b5: { name: 'Half-Diminished (m7♭5)', intervals: [0, 3, 6, 10] },
  aug7: { name: 'Augmented 7 (7♯5)', intervals: [0, 4, 8, 10] },
  dom7sus4: { name: '7 Sus4', intervals: [0, 5, 7, 10] },
  add9: { name: 'Add 9', intervals: [0, 4, 7, 14] },
  dom9: { name: 'Dominant 9', intervals: [0, 4, 7, 10, 14] },
  maj9: { name: 'Major 9', intervals: [0, 4, 7, 11, 14] },
  m9: { name: 'Minor 9', intervals: [0, 3, 7, 10, 14] },
  dom11: { name: 'Dominant 11', intervals: [0, 4, 7, 10, 14, 17] },
  dom13: { name: 'Dominant 13', intervals: [0, 4, 7, 10, 14, 21] },
  dom7b9: { name: 'Dominant 7♭9', intervals: [0, 4, 7, 10, 13] },
  dom7s9: { name: 'Dominant 7♯9', intervals: [0, 4, 7, 10, 15] },
}

export function chordNotes(root, qualityKey) {
  const chord = CHORDS[qualityKey]
  if (!chord) throw new Error(`Unknown chord quality: ${qualityKey}`)
  const rootNumber = noteToNumber(root)
  return chord.intervals.map((interval, degree) => ({
    semitone: normalize(rootNumber + interval),
    degree,
  }))
}
