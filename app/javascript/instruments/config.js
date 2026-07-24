// Fretboard instruments carry named tunings (low string -> high string);
// keyboard/brass instruments don't. `defaultTuning` helpers below resolve the
// active tuning's `strings` into the `tuning` array the renderers expect.
// Note names in `strings` must be spellings noteToNumber knows (ASCII: Eb, Ab...).
export const INSTRUMENTS = {
  guitar: {
    name: 'Guitar', type: 'fretboard', frets: 17,
    tunings: {
      standard: { name: 'Standard (EADGBE)', strings: ['E', 'A', 'D', 'G', 'B', 'E'] },
      dropd: { name: 'Drop D (DADGBE)', strings: ['D', 'A', 'D', 'G', 'B', 'E'] },
      dadgad: { name: 'DADGAD', strings: ['D', 'A', 'D', 'G', 'A', 'D'] },
      openg: { name: 'Open G (DGDGBD)', strings: ['D', 'G', 'D', 'G', 'B', 'D'] },
      eflat: { name: 'E♭ (half-step down)', strings: ['Eb', 'Ab', 'Db', 'Gb', 'Bb', 'Eb'] },
    },
  },
  guitar7: {
    name: '7-String Guitar', type: 'fretboard', frets: 17,
    tunings: {
      standard: { name: 'Standard (BEADGBE)', strings: ['B', 'E', 'A', 'D', 'G', 'B', 'E'] },
    },
  },
  bass: {
    name: 'Bass', type: 'fretboard', frets: 20,
    tunings: {
      standard: { name: '4-String (EADG)', strings: ['E', 'A', 'D', 'G'] },
      five: { name: '5-String (BEADG)', strings: ['B', 'E', 'A', 'D', 'G'] },
    },
  },
  ukulele: {
    name: 'Ukulele', type: 'fretboard', frets: 15,
    tunings: {
      standard: { name: 'Standard (GCEA)', strings: ['G', 'C', 'E', 'A'] },
      baritone: { name: 'Baritone (DGBE)', strings: ['D', 'G', 'B', 'E'] },
    },
  },
  mandolin: {
    name: 'Mandolin', type: 'fretboard', frets: 20,
    tunings: {
      standard: { name: 'Standard (GDAE)', strings: ['G', 'D', 'A', 'E'] },
    },
  },
  banjo: {
    name: 'Banjo (tenor)', type: 'fretboard', frets: 19,
    tunings: {
      standard: { name: 'Tenor (CGDA)', strings: ['C', 'G', 'D', 'A'] },
      irish: { name: 'Irish (GDAE)', strings: ['G', 'D', 'A', 'E'] },
    },
  },
  piano: { name: 'Piano', type: 'keyboard', octaves: 2, startNote: 'C' },
  trumpet: { name: 'Trumpet (B♭)', type: 'brass', valves: 3, clef: 'treble' },
}

// First tuning key for an instrument (its default).
export function defaultTuningKey(config) {
  return config.tunings ? Object.keys(config.tunings)[0] : null
}

// The string array for a given tuning key, falling back to the default.
export function tuningStrings(config, tuningKey) {
  if (!config.tunings) return config.tuning || []
  const tuning = config.tunings[tuningKey] || config.tunings[defaultTuningKey(config)]
  return tuning.strings
}
