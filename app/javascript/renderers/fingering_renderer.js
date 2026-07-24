import { numberToNote } from 'theory/notes'
import { colorForDegree } from 'renderers/palette'

// Standard three-valve brass fingering by pitch class (the beginner chart).
// [] = open. Each valve lowers the pitch: 2nd = -1 semitone, 1st = -2, 1+2 = -3,
// 2+3 = -4, 1+3 = -5, 1+2+3 = -6, relative to the nearest open harmonic.
const THREE_VALVE = {
  0: [], //        C  open
  1: [1, 2, 3], // Db 1-2-3
  2: [1, 3], //    D  1-3
  3: [2, 3], //    Eb 2-3
  4: [1, 2], //    E  1-2
  5: [1], //       F  1
  6: [2], //       Gb 2
  7: [], //        G  open
  8: [2, 3], //    Ab 2-3
  9: [1, 2], //    A  1-2
  10: [1], //      Bb 1
  11: [2], //      B  2
}

// Pure: valves pressed for a written pitch class. Same chart for trumpet, tuba,
// baritone, euphonium — they differ only by transpose/clef, handled upstream.
export function threeValveFingering(pitchClass) {
  return THREE_VALVE[((pitchClass % 12) + 12) % 12]
}

const LAYOUT = { x: 20, y: 30, cardWidth: 74, cardGap: 26, valveRadius: 11, valveGap: 6 }

// `notes` here are already the WRITTEN (transposed) notes for the instrument.
export function draw(ctx, config, notes, { accidental = 'sharp' } = {}) {
  const width = LAYOUT.x * 2 + notes.length * (LAYOUT.cardWidth + LAYOUT.cardGap)
  const height = LAYOUT.y + 150

  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const valveY = LAYOUT.y + 40

  notes.forEach((note, i) => {
    const cardLeft = LAYOUT.x + i * (LAYOUT.cardWidth + LAYOUT.cardGap)
    const cx = cardLeft + LAYOUT.cardWidth / 2
    const pressed = threeValveFingering(note.semitone)
    const color = colorForDegree(note.degree)

    // divider between this fingering group and the previous one
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

    // written note name, degree-colored
    ctx.fillStyle = color
    ctx.font = 'bold 18px sans-serif'
    ctx.fillText(numberToNote(note.semitone, accidental), cx, LAYOUT.y)

    // three valves
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

    // "open" label when no valves pressed
    if (pressed.length === 0) {
      ctx.fillStyle = '#666'
      ctx.font = 'italic 11px sans-serif'
      ctx.fillText('open', cx, valveY + LAYOUT.valveRadius + 16)
    }
  })

  ctx.restore()
  return { width, height }
}
