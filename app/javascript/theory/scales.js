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

  // East Asian
  chinese_gong: { name: 'Chinese Gong (宫)', group: 'East Asian', formula: 'Chinese pentatonic mode 1 — same notes as major pentatonic', intervals: [0, 2, 4, 7, 9] },
  chinese_shang: { name: 'Chinese Shang (商)', group: 'East Asian', formula: 'Chinese pentatonic mode 2 — no 3rd, open and airy (also called "Egyptian")', intervals: [0, 2, 5, 7, 10] },
  chinese_jue: { name: 'Chinese Jue (角)', group: 'East Asian', formula: 'Chinese pentatonic mode 3 — minor 3rd, 4th, ♭6, ♭7; no 2nd and no 5th', intervals: [0, 3, 5, 8, 10] },
  chinese_zhi: { name: 'Chinese Zhi (徵)', group: 'East Asian', formula: 'Chinese pentatonic mode 4 — no 3rd, with a bright 6th', intervals: [0, 2, 5, 7, 9] },
  chinese_yu: { name: 'Chinese Yu (羽)', group: 'East Asian', formula: 'Chinese pentatonic mode 5 — same notes as minor pentatonic', intervals: [0, 3, 5, 7, 10] },
  hirajoshi: { name: 'Japanese Hirajōshi', group: 'East Asian', formula: 'Koto tuning: minor 3rd and ♭6, no 4th or 7th', intervals: [0, 2, 3, 7, 8] },
  in_sen: { name: 'Japanese In (Miyako-bushi)', group: 'East Asian', formula: 'Dark pentatonic with a ♭2 and ♭6', intervals: [0, 1, 5, 7, 8] },
  insen: { name: 'Japanese Insen', group: 'East Asian', formula: 'Shakuhachi scale: ♭2 and ♭7, no 3rd', intervals: [0, 1, 5, 7, 10] },
  iwato: { name: 'Japanese Iwato', group: 'East Asian', formula: 'Very dark: ♭2, ♭5 and ♭7 — no 5th at all', intervals: [0, 1, 5, 6, 10] },
  yo: { name: 'Japanese Yo', group: 'East Asian', formula: 'Folk-song pentatonic: no semitones, no 3rd', intervals: [0, 2, 5, 7, 9] },
  kumoi: { name: 'Japanese Kumoi', group: 'East Asian', formula: 'Minor-ish pentatonic: minor 3rd and a major 6th', intervals: [0, 2, 3, 7, 9] },
  pelog: { name: 'Balinese Pelog (approx.)', group: 'East Asian', formula: 'Gamelan scale squeezed into piano notes — the real one sits between our pitches', intervals: [0, 1, 3, 7, 8] },
  slendro: { name: 'Javanese Slendro (approx.)', group: 'East Asian', formula: 'Gamelan scale of 5 nearly equal steps, approximated on piano notes', intervals: [0, 2, 5, 7, 9] },

  // Indian ragas (the scale only — a raga also has set phrases and ornaments)
  raga_bhairav: { name: 'Raga Bhairav', group: 'Indian ragas', formula: 'Morning raga: ♭2 and ♭6 with a major 3rd and 7th', intervals: [0, 1, 4, 5, 7, 8, 11] },
  raga_todi: { name: 'Raga Todi', group: 'Indian ragas', formula: '♭2, ♭3, ♯4, ♭6 — intense and serious', intervals: [0, 1, 3, 6, 7, 8, 11] },
  raga_marwa: { name: 'Raga Marwa', group: 'Indian ragas', formula: 'Sunset raga: ♭2 and ♯4, the 5th is skipped', intervals: [0, 1, 4, 6, 9, 11] },
  raga_purvi: { name: 'Raga Purvi', group: 'Indian ragas', formula: 'Evening raga: ♭2, ♯4 and ♭6', intervals: [0, 1, 4, 6, 7, 8, 11] },
  raga_bhupali: { name: 'Raga Bhupali', group: 'Indian ragas', formula: 'Same notes as major pentatonic — calm evening raga', intervals: [0, 2, 4, 7, 9] },

  // Middle Eastern & Eastern European
  double_harmonic: { name: 'Double Harmonic (Byzantine)', group: 'Middle Eastern & E. European', formula: 'Two "exotic" 1½-step gaps: ♭2 and ♭6 with major 3rd and 7th', intervals: [0, 1, 4, 5, 7, 8, 11] },
  persian: { name: 'Persian', group: 'Middle Eastern & E. European', formula: 'Double harmonic with a ♭5', intervals: [0, 1, 4, 5, 6, 8, 11] },
  hungarian_major: { name: 'Hungarian Major', group: 'Middle Eastern & E. European', formula: 'Major-ish with ♯2, ♯4 and ♭7', intervals: [0, 3, 4, 6, 7, 9, 10] },
  ukrainian_dorian: { name: 'Ukrainian Dorian (Romanian Minor)', group: 'Middle Eastern & E. European', formula: 'Dorian with a ♯4', intervals: [0, 2, 3, 6, 7, 9, 10] },
  neapolitan_minor: { name: 'Neapolitan Minor', group: 'Middle Eastern & E. European', formula: 'Harmonic minor with a ♭2', intervals: [0, 1, 3, 5, 7, 8, 11] },
  neapolitan_major: { name: 'Neapolitan Major', group: 'Middle Eastern & E. European', formula: 'Melodic minor with a ♭2', intervals: [0, 1, 3, 5, 7, 9, 11] },
  enigmatic: { name: 'Enigmatic', group: 'Middle Eastern & E. European', formula: 'Verdi\'s puzzle scale: ♭2 then whole steps up to a major 7th', intervals: [0, 1, 4, 6, 8, 10, 11] },

  // Ancient & other
  greek_chromatic: { name: 'Ancient Greek Chromatic', group: 'Ancient & other', formula: 'Two Greek "chromatic" tetrachords: half, half, then a 1½-step leap', intervals: [0, 1, 2, 5, 7, 8, 9] },
  greek_enharmonic: { name: 'Ancient Greek Enharmonic (approx.)', group: 'Ancient & other', formula: 'Greek quarter-tone tetrachords rounded to half steps — a 2-step leap in each half', intervals: [0, 1, 5, 7, 8] },
  prometheus: { name: 'Prometheus (Scriabin)', group: 'Ancient & other', formula: 'Scriabin\'s "mystic chord" as a scale: whole tone with a 6th', intervals: [0, 2, 4, 6, 9, 10] },
  augmented: { name: 'Augmented', group: 'Ancient & other', formula: 'Alternating 1½ and ½ steps — two augmented triads interlocked', intervals: [0, 3, 4, 7, 8, 11] },
  bebop_dominant: { name: 'Bebop Dominant', group: 'Ancient & other', formula: 'Mixolydian plus a major 7th passing note — 8 notes so runs land on the beat', intervals: [0, 2, 4, 5, 7, 9, 10, 11] },
  bebop_major: { name: 'Bebop Major', group: 'Ancient & other', formula: 'Major plus a ♭6 passing note', intervals: [0, 2, 4, 5, 7, 8, 9, 11] },
  chromatic: { name: 'Chromatic', group: 'Ancient & other', formula: 'All 12 notes', intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
}

// Major/minor scales that share all their notes when the minor one starts a
// minor 3rd below (C major = A minor, C major blues = A minor blues). On the
// circle these pair up like relative keys: outer ring major, inner ring minor.
const RELATIVE_PAIRS = [
  { major: 'major', minor: 'aeolian' },
  { major: 'major_blues', minor: 'blues' },
  { major: 'major_pentatonic', minor: 'minor_pentatonic' },
]

// Pure: the { major, minor } pair this scale belongs to, or null.
export function relativePair(scaleKey) {
  const key = scaleKey === 'minor' ? 'aeolian' : scaleKey
  return RELATIVE_PAIRS.find((p) => p.major === key || p.minor === key) || null
}

// Dropdown sections, in order. Scales without a `group` fall under DEFAULT_GROUP
// by key, else 'Other'.
export const GROUP_ORDER = ['Western modes', 'Pentatonic & blues', 'Minor & jazz', 'Symmetric', 'East Asian', 'Indian ragas', 'Middle Eastern & E. European', 'Ancient & other']
const DEFAULT_GROUP = {
  major: 'Western modes', dorian: 'Western modes', phrygian: 'Western modes', lydian: 'Western modes',
  mixolydian: 'Western modes', aeolian: 'Western modes', locrian: 'Western modes',
  major_pentatonic: 'Pentatonic & blues', minor_pentatonic: 'Pentatonic & blues', blues: 'Pentatonic & blues', major_blues: 'Pentatonic & blues',
  harmonic_minor: 'Minor & jazz', melodic_minor: 'Minor & jazz', phrygian_dominant: 'Minor & jazz', lydian_dominant: 'Minor & jazz', altered: 'Minor & jazz',
  whole_tone: 'Symmetric', diminished_wh: 'Symmetric', diminished_hw: 'Symmetric',
  hungarian_minor: 'Middle Eastern & E. European',
}

// Pure: the dropdown section a scale belongs to.
export function scaleGroup(key) {
  return SCALES[key]?.group || DEFAULT_GROUP[key] || 'Ancient & other'
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
