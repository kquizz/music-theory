import { numberToNote } from 'theory/notes'
import { colorForDegree } from 'renderers/palette'

// Saxophone fingerings keyed by pitch class (written pitch). All saxophones share
// these — only transposition/octave differs. Keys: octave (thumb), left-hand main
// L1/L2/L3, right-hand main R1/R2/R3, plus auxiliaries G# and Eb (pinky), bis (Bb).
// The upper register is identical + the octave key, so we add 'oct' by register
// rather than tabulating twice. Source: the Woodwind Fingering Guide basic chart.
const SAX_BY_PC = {
  0: ['L2'], //                      C   (left middle only)
  1: [], //                          C#  (all open)
  2: ['L1', 'L2', 'L3', 'R1', 'R2', 'R3'], // D (all six)
  3: ['L1', 'L2', 'L3', 'R1', 'R2', 'R3', 'Eb'], // Eb/D#
  4: ['L1', 'L2', 'L3', 'R1', 'R2'], // E
  5: ['L1', 'L2', 'L3', 'R1'], //     F
  6: ['L1', 'L2', 'L3', 'R2'], //     F#/Gb  (forked F#)
  7: ['L1', 'L2', 'L3'], //           G
  8: ['L1', 'L2', 'L3', 'Gs'], //     G#/Ab
  9: ['L1', 'L2'], //                 A
  10: ['L1', 'L2', 'bis'], //         Bb/A#  (bis Bb)
  11: ['L1'], //                      B
}

// Written-pitch saxophone fingering for a MIDI note: the pitch-class key set, plus
// the octave key from written D5 (74) upward (the register break above open C#5).
export function saxFingering(midi) {
  const pc = ((midi % 12) + 12) % 12
  const keys = [...SAX_BY_PC[pc]]
  if (midi >= 74) keys.push('oct')
  return keys
}

// Key positions within a card, relative to the body's top-center. r is the radius.
const KEY_LAYOUT = [
  { id: 'oct', dx: -24, dy: 2, r: 6 },
  { id: 'bis', dx: -13, dy: 18, r: 4 },
  { id: 'L1', dx: 0, dy: 16, r: 8 },
  { id: 'L2', dx: 0, dy: 34, r: 8 },
  { id: 'L3', dx: 0, dy: 52, r: 8 },
  { id: 'Gs', dx: -15, dy: 58, r: 4 },
  { id: 'R1', dx: 0, dy: 74, r: 8 },
  { id: 'R2', dx: 0, dy: 92, r: 8 },
  { id: 'R3', dx: 0, dy: 110, r: 8 },
  { id: 'Eb', dx: 15, dy: 116, r: 4 },
]

const LAYOUT = { x: 20, y: 30, cardWidth: 64, cardGap: 26, rowStride: 170 }

function drawCard(ctx, note, midi, cardLeft, topY, accidental, showDivider) {
  const cx = cardLeft + LAYOUT.cardWidth / 2
  const bodyTop = topY + 16
  const color = colorForDegree(note.degree)
  const pressed = new Set(saxFingering(midi))

  if (showDivider) {
    const dividerX = cardLeft - LAYOUT.cardGap / 2
    ctx.strokeStyle = '#eee'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(dividerX, topY - 8)
    ctx.lineTo(dividerX, bodyTop + 130)
    ctx.stroke()
  }

  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = 'bold 18px sans-serif'
  ctx.fillText(numberToNote(note.semitone, accidental), cx, topY)

  KEY_LAYOUT.forEach((key) => {
    const on = pressed.has(key.id)
    ctx.beginPath()
    ctx.arc(cx + key.dx, bodyTop + key.dy, key.r, 0, Math.PI * 2)
    ctx.fillStyle = on ? color : '#fff'
    ctx.fill()
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1.3
    ctx.stroke()
  })
}

// One key-diagram card per note; groups stack as rows (one per octave), like brass.
export function draw(ctx, config, groups, { accidental = 'sharp' } = {}) {
  const flat = groups.flat()
  const baseMidi = config.baseMidi || 60 // must be C-aligned (≡0 mod 12)
  let prev = -Infinity
  const midis = flat.map((n) => {
    let m = baseMidi + n.semitone
    while (m <= prev) m += 12
    prev = m
    return m
  })
  const maxCards = Math.max(...groups.map((g) => g.length), 1)
  const width = LAYOUT.x * 2 + maxCards * (LAYOUT.cardWidth + LAYOUT.cardGap)
  const height = LAYOUT.y + groups.length * LAYOUT.rowStride

  ctx.save()
  let idx = 0
  const hits = []
  groups.forEach((group, row) => {
    const topY = LAYOUT.y + row * LAYOUT.rowStride
    group.forEach((note, j) => {
      const cardLeft = LAYOUT.x + j * (LAYOUT.cardWidth + LAYOUT.cardGap)
      drawCard(ctx, note, midis[idx], cardLeft, topY, accidental, j > 0)
      hits.push({ x: cardLeft, y: topY - 12, w: LAYOUT.cardWidth, h: 150, midi: midis[idx] })
      idx += 1
    })
  })
  ctx.restore()
  return { width, height, hits }
}
