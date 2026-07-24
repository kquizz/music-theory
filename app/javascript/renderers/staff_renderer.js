import { numberToNote } from 'theory/notes'
import { colorForDegree } from 'renderers/palette'

const LETTER_STEP = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 }
const LAYOUT = { x: 30, y: 30, lineGap: 12, width: 360 }

// Pure: split a note name into staff letter/step + accidental glyph.
export function staffPlacement(noteName) {
  const letter = noteName[0]
  const accidentalChar = noteName[1] || ''
  const accidental = accidentalChar === '#' ? '#' : accidentalChar === 'b' ? 'b' : ''
  return { letter, step: LETTER_STEP[letter], accidental }
}

export function draw(ctx, notes, { accidental = 'sharp' } = {}) {
  const width = LAYOUT.x + LAYOUT.width + 20
  const height = LAYOUT.y + 8 * LAYOUT.lineGap + 30
  // treble staff: 5 lines, bottom line = E4. step counts diatonic positions up from C4.
  const bottomY = LAYOUT.y + 4 * LAYOUT.lineGap // baseline at bottom staff line (E4)
  const stepToY = (step) => {
    // C4 sits one ledger step below bottom line E4. Each diatonic step = half lineGap.
    const stepsAboveC4 = step
    const stepsAboveE4 = stepsAboveC4 - 2 // E4 is step 2
    return bottomY - stepsAboveE4 * (LAYOUT.lineGap / 2)
  }

  ctx.save()
  ctx.strokeStyle = '#333'
  for (let i = 0; i < 5; i++) {
    const y = LAYOUT.y + i * LAYOUT.lineGap
    ctx.beginPath()
    ctx.moveTo(LAYOUT.x, y)
    ctx.lineTo(LAYOUT.x + LAYOUT.width, y)
    ctx.stroke()
  }

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '14px serif'
  notes.forEach((note, i) => {
    const name = numberToNote(note.semitone, accidental)
    const { step, accidental: acc } = staffPlacement(name)
    const x = LAYOUT.x + 40 + i * ((LAYOUT.width - 60) / Math.max(notes.length, 1))
    const y = stepToY(step)
    ctx.fillStyle = colorForDegree(note.degree)
    ctx.beginPath()
    ctx.ellipse(x, y, 6, 4.5, 0, 0, Math.PI * 2)
    ctx.fill()
    if (acc) {
      ctx.fillStyle = '#333'
      ctx.fillText(acc, x - 12, y)
    }
  })
  ctx.restore()
  return { width, height }
}
