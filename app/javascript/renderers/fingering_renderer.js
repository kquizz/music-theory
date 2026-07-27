import { numberToNote } from 'theory/notes'
import { colorForDegree } from 'renderers/palette'

// Trumpet fingerings keyed by ABSOLUTE written pitch (MIDI note number, C4 = 60).
// Fingerings change by octave — the upper register uses higher harmonics, so e.g.
// low D (D4=62) is 1-3 but high D (D5=74) is just 1. [] = open.
const TRUMPET = {
  54: [1, 2, 3], // F#3
  55: [1, 3], //    G3
  56: [2, 3], //    G#3
  57: [1, 2], //    A3
  58: [1], //       Bb3
  59: [2], //       B3
  60: [], //        C4
  61: [1, 2, 3], // C#4
  62: [1, 3], //    D4
  63: [2, 3], //    Eb4
  64: [1, 2], //    E4
  65: [1], //       F4
  66: [2], //       F#4
  67: [], //        G4
  68: [2, 3], //    G#4
  69: [1, 2], //    A4
  70: [1], //       Bb4
  71: [2], //       B4
  72: [], //        C5
  73: [1, 2], //    C#5
  74: [1], //       D5  (not 1-3 like D4!)
  75: [2], //       Eb5
  76: [], //        E5  (open, not 1-2 like E4)
  77: [1], //       F5
  78: [2], //       F#5
  79: [], //        G5
  80: [2, 3], //    G#5
  81: [1, 2], //    A5
  82: [1], //       Bb5
  83: [2], //       B5
  84: [], //        C6
}

// Generic three-valve chart by pitch class, used as a fallback outside the
// tabulated trumpet range.
const THREE_VALVE = {
  0: [], 1: [1, 2, 3], 2: [1, 3], 3: [2, 3], 4: [1, 2], 5: [1],
  6: [2], 7: [], 8: [2, 3], 9: [1, 2], 10: [1], 11: [2],
}

// Fingering for an absolute written pitch (MIDI). Falls back to the pitch-class
// chart when out of the tabulated range.
export function trumpetFingering(midi) {
  return TRUMPET[midi] || THREE_VALVE[((midi % 12) + 12) % 12]
}

// How many semitones (0..6) a note sits below the nearest open (1st-position /
// no-valve) partial of a B♭ brass instrument, skipping the out-of-tune 7th/11th
// partials. This is the physical basis for both slide positions and valve combos.
function harmonicLowering(midi, partials) {
  for (let d = 0; d <= 6; d += 1) if (partials.includes(midi + d)) return d
  return null
}

// Valve combination that lowers the open pitch by d semitones (standard 3-valve
// system: 2nd=−1, 1st=−2, 1+2=−3, 2+3=−4, 1+3=−5, all three=−6).
const LOWER_TO_VALVES = [[], [2], [1], [1, 2], [2, 3], [1, 3], [1, 2, 3]]

// Tenor trombone (B♭): 1st-position B♭ overtone series. Slide position = lowering + 1.
const SLIDE_PARTIALS = [34, 46, 53, 58, 62, 65, 70, 72, 74, 77] // Bb1 Bb2 F3 Bb3 D4 F4 Bb4 C5 D5 F5
export function slidePosition(midi) {
  const d = harmonicLowering(midi, SLIDE_PARTIALS)
  return d == null ? null : d + 1
}

// BB♭ tuba: open (no-valve) overtone series, an octave below the trombone's.
const TUBA_PARTIALS = [22, 34, 41, 46, 50, 53, 58, 60, 62, 65] // Bb0 Bb1 F2 Bb2 D3 F3 Bb3 C4 D4 F4
export function tubaFingering(midi) {
  const d = harmonicLowering(midi, TUBA_PARTIALS)
  return d == null ? [] : LOWER_TO_VALVES[d]
}

// Fingering for a valve-brass instrument. `trumpet` uses the octave-aware trumpet
// table (shared by B♭ treble-clef brass like euphonium/baritone T.C.); `bbb-tuba`
// derives the BB♭ tuba combo from the overtone series; `three-valve` is a generic
// pitch-class fallback.
export function valveFingering(midi, system = 'trumpet') {
  if (system === 'bbb-tuba') return tubaFingering(midi)
  if (system === 'three-valve') return THREE_VALVE[((midi % 12) + 12) % 12]
  return trumpetFingering(midi)
}

// Pure: assign ascending absolute pitches (MIDI) to a note sequence, starting the
// first note in octave 4 (C4 = 60) and climbing so each note is higher than the
// previous — so a 2-octave scale gets its real upper-octave pitches (and thus the
// correct upper-register fingerings).
export function absolutePitches(notes, baseC = 60) {
  let prev = -Infinity
  return notes.map((n) => {
    let midi = baseC + n.semitone
    while (midi <= prev) midi += 12
    prev = midi
    return midi
  })
}

const LAYOUT = {
  x: 20, y: 30, cardWidth: 74, cardGap: 26, valveRadius: 11, valveGap: 6, rowStride: 110,
}

// A trombone slide: a horizontal rail with 7 position ticks and a filled marker
// at the note's primary position, plus the position number below.
function drawSlide(ctx, cx, valveY, midi, color) {
  const pos = slidePosition(midi)
  const halfW = 33
  const y = valveY
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx - halfW, y)
  ctx.lineTo(cx + halfW, y)
  ctx.stroke()
  for (let i = 1; i <= 7; i += 1) {
    const tx = cx - halfW + (2 * halfW) * (i - 1) / 6
    const on = i === pos
    ctx.beginPath()
    ctx.arc(tx, y, on ? 6 : 2.5, 0, Math.PI * 2)
    ctx.fillStyle = on ? color : '#bbb'
    ctx.fill()
  }
  ctx.fillStyle = pos ? color : '#666'
  ctx.font = pos ? 'bold 14px sans-serif' : 'italic 11px sans-serif'
  ctx.fillText(pos ? `${pos}${pos === 1 ? 'st' : pos === 2 ? 'nd' : pos === 3 ? 'rd' : 'th'}` : '—',
    cx, y + 20)
}

function drawCard(ctx, config, note, midi, cardLeft, topY, accidental, showDivider) {
  const cx = cardLeft + LAYOUT.cardWidth / 2
  const valveY = topY + 40
  const color = colorForDegree(note.degree)

  if (showDivider) {
    const dividerX = cardLeft - LAYOUT.cardGap / 2
    ctx.strokeStyle = '#ddd'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(dividerX, topY - 8)
    ctx.lineTo(dividerX, valveY + LAYOUT.valveRadius + 8)
    ctx.stroke()
    ctx.fillStyle = '#bbb'
    ctx.font = '12px sans-serif'
    ctx.fillText('•', dividerX, valveY)
  }

  ctx.fillStyle = color
  ctx.font = 'bold 18px sans-serif'
  ctx.fillText(numberToNote(note.semitone, accidental), cx, topY)

  if (config.fingering === 'slide') {
    drawSlide(ctx, cx, valveY, midi, color)
    return
  }

  const pressed = valveFingering(midi, config.fingering)
  const totalW = 3 * (LAYOUT.valveRadius * 2) + 2 * LAYOUT.valveGap
  const startX = cx - totalW / 2 + LAYOUT.valveRadius
  for (let v = 1; v <= (config.valves || 3); v++) {
    const vx = startX + (v - 1) * (LAYOUT.valveRadius * 2 + LAYOUT.valveGap)
    const isPressed = pressed.includes(v)
    ctx.beginPath()
    ctx.arc(vx, valveY, LAYOUT.valveRadius, 0, Math.PI * 2)
    ctx.fillStyle = isPressed ? color : '#fff'
    ctx.fill()
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.fillStyle = isPressed ? '#fff' : '#999'
    ctx.font = '11px sans-serif'
    ctx.fillText(String(v), vx, valveY)
  }

  if (pressed.length === 0) {
    ctx.fillStyle = '#666'
    ctx.font = 'italic 11px sans-serif'
    ctx.fillText('open', cx, valveY + LAYOUT.valveRadius + 16)
  }
}

// `groups` is one note array per octave — each becomes its own row of cards, so
// two octaves stack on two lines. Pitches are numbered continuously across groups
// so the upper row gets its correct upper-register fingerings.
export function draw(ctx, config, groups, { accidental = 'sharp' } = {}) {
  const midis = absolutePitches(groups.flat(), config.baseMidi || 60)
  const maxCards = Math.max(...groups.map((g) => g.length), 1)
  const width = LAYOUT.x * 2 + maxCards * (LAYOUT.cardWidth + LAYOUT.cardGap)
  const height = LAYOUT.y + groups.length * LAYOUT.rowStride

  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  let idx = 0
  const hits = []
  groups.forEach((group, row) => {
    const topY = LAYOUT.y + row * LAYOUT.rowStride
    group.forEach((note, j) => {
      const cardLeft = LAYOUT.x + j * (LAYOUT.cardWidth + LAYOUT.cardGap)
      drawCard(ctx, config, note, midis[idx], cardLeft, topY, accidental, j > 0)
      hits.push({ x: cardLeft, y: topY - 12, w: LAYOUT.cardWidth, h: 80, midi: midis[idx] })
      idx += 1
    })
  })

  ctx.restore()
  return { width, height, hits }
}
