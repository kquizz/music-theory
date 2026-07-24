// Tuning is listed low string to high string.
// `transpose` is how many semitones the WRITTEN note sits above the sounding
// (concert) pitch — e.g. a Bb instrument reads a major 2nd (2) higher.
export const INSTRUMENTS = {
  guitar: { name: 'Guitar', type: 'fretboard', tuning: ['E', 'A', 'D', 'G', 'B', 'E'], frets: 17 },
  piano: { name: 'Piano', type: 'keyboard', octaves: 2, startNote: 'C' },
  trumpet: { name: 'Trumpet (B♭)', type: 'brass', valves: 3, transpose: 2, clef: 'treble' },
}
