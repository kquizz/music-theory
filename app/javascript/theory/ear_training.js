import { CHORDS } from 'theory/chords'

// Intervals the quiz can ask about, ascending from a minor 2nd to the octave.
export const EAR_INTERVALS = [
  { semitones: 1, short: 'm2', name: 'Minor 2nd' },
  { semitones: 2, short: 'M2', name: 'Major 2nd' },
  { semitones: 3, short: 'm3', name: 'Minor 3rd' },
  { semitones: 4, short: 'M3', name: 'Major 3rd' },
  { semitones: 5, short: 'P4', name: 'Perfect 4th' },
  { semitones: 6, short: 'TT', name: 'Tritone' },
  { semitones: 7, short: 'P5', name: 'Perfect 5th' },
  { semitones: 8, short: 'm6', name: 'Minor 6th' },
  { semitones: 9, short: 'M6', name: 'Major 6th' },
  { semitones: 10, short: 'm7', name: 'Minor 7th' },
  { semitones: 11, short: 'M7', name: 'Major 7th' },
  { semitones: 12, short: 'P8', name: 'Octave' },
]

// Chord qualities the quiz can ask about, drawn from the shared CHORDS table so
// their interval definitions stay in one place.
const CHORD_KEYS = ['maj', 'min', 'dim', 'aug', 'dom7', 'maj7', 'm7']
export const EAR_CHORDS = CHORD_KEYS.map((key) => ({
  key,
  name: CHORDS[key].name,
  intervals: CHORDS[key].intervals,
}))

// The two MIDI notes of an interval played from a root.
export function intervalMidis(rootMidi, semitones) {
  return [rootMidi, rootMidi + semitones]
}

// The MIDI notes of a chord (interval offsets) played from a root.
export function chordMidis(rootMidi, intervals) {
  return intervals.map((i) => rootMidi + i)
}
