// Tuning is listed low string to high string.
// Note names you pick are the notes shown/fingered directly (written pitch).
export const INSTRUMENTS = {
  guitar: { name: 'Guitar', type: 'fretboard', tuning: ['E', 'A', 'D', 'G', 'B', 'E'], frets: 17 },
  piano: { name: 'Piano', type: 'keyboard', octaves: 2, startNote: 'C' },
  trumpet: { name: 'Trumpet (B♭)', type: 'brass', valves: 3, clef: 'treble' },
}
