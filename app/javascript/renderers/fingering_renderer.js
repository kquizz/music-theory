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

const LAYOUT = { x: 20, y: 30, cardWidth: 74, cardGap: 26, valveRadius: 11, valveGap: 6 }

export function draw(ctx, config, notes, { accidental = 'sharp' } = {}) {
  const width = LAYOUT.x * 2 + notes.length * (LAYOUT.cardWidth + LAYOUT.cardGap)
  const height = LAYOUT.y + 150
  const valveY = LAYOUT.y + 40
  const midis = absolutePitches(notes)

  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  notes.forEach((note, i) => {
    const cardLeft = LAYOUT.x + i * (LAYOUT.cardWidth + LAYOUT.cardGap)
    const cx = cardLeft + LAYOUT.cardWidth / 2
    const pressed = trumpetFingering(midis[i])
    const color = colorForDegree(note.degree)

    if (i > 0) {
      const dividerX = cardLeft - LAYOUT.cardGap / 2
      ctx.strokeStyle = '#ddd'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(dividerX, LAYOUT.y - 8)
      ctx.lineTo(dividerX, valveY + LAYOUT.valveRadius + 8)
      ctx.stroke()
      ctx.fillStyle = '#bbb'
      ctx.font = '12px sans-serif'
      ctx.fillText('•', dividerX, valveY)
    }

    ctx.fillStyle = color
    ctx.font = 'bold 18px sans-serif'
    ctx.fillText(numberToNote(note.semitone, accidental), cx, LAYOUT.y)

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
  })

  ctx.restore()
  return { width, height }
}
