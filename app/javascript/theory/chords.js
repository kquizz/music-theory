import { noteToNumber, normalize } from 'theory/notes'

export const CHORDS = {
  maj: { name: 'Major', intervals: [0, 4, 7] },
  min: { name: 'Minor', intervals: [0, 3, 7] },
  dim: { name: 'Diminished', intervals: [0, 3, 6] },
  aug: { name: 'Augmented', intervals: [0, 4, 8] },
  sus2: { name: 'Sus2', intervals: [0, 2, 7] },
  sus4: { name: 'Sus4', intervals: [0, 5, 7] },
  6: { name: 'Major 6', intervals: [0, 4, 7, 9] },
  m6: { name: 'Minor 6', intervals: [0, 3, 7, 9] },
  maj7: { name: 'Major 7', intervals: [0, 4, 7, 11] },
  m7: { name: 'Minor 7', intervals: [0, 3, 7, 10] },
  7: { name: 'Dominant 7', intervals: [0, 4, 7, 10] },
  dim7: { name: 'Diminished 7', intervals: [0, 3, 6, 9] },
  m7b5: { name: 'Half-Diminished (m7♭5)', intervals: [0, 3, 6, 10] },
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
