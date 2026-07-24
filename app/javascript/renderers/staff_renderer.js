import { numberToNote, noteToNumber } from 'theory/notes'
import { colorForDegree } from 'renderers/palette'

const LETTER_STEP = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 }
const LAYOUT = { x: 30, y: 40, lineGap: 12, width: 360, clefWidth: 34 }
const CLEF_GLYPH = { treble: '𝄞', bass: '𝄢' }

// Pure: split a note name into staff letter/step + accidental glyph.
export function staffPlacement(noteName) {
  const letter = noteName[0]
  const accidentalChar = noteName[1] || ''
  const accidental = accidentalChar === '#' ? '#' : accidentalChar === 'b' ? 'b' : ''
  return { letter, step: LETTER_STEP[letter], accidental }
}

// Pure: voice an ordered list of note names as an ASCENDING line, so a chord or
// scale climbs the staff. Octave placement is decided by actual PITCH (semitones),
// not diatonic step — so a chromatic run keeps sharps/flats on their natural's
// line (C# shares C's line with a ♯) instead of jumping an octave per accidental.
// `abs` is the diatonic staff index (7 per octave); C4 = 0, E4 (bottom line) = 2.
export function ascendingPlacements(noteNames) {
  let prevPitch = -Infinity
  let octave = 0
  return noteNames.map((name) => {
    const { letter, step, accidental } = staffPlacement(name)
    const pitchClass = noteToNumber(name)
    while (octave * 12 + pitchClass <= prevPitch) octave += 1
    prevPitch = octave * 12 + pitchClass
    return { name, letter, step, accidental, abs: octave * 7 + step }
  })
}

// Ledger-line diatonic positions (even `abs`) needed for a note outside the
// staff. Bottom line E4 = abs 2, top line F5 = abs 10; middle C4 = abs 0.
function ledgerPositions(abs) {
  const ledgers = []
  if (abs <= 1) {
    for (let l = 0; l >= abs; l -= 2) ledgers.push(l)
  } else if (abs >= 11) {
    for (let l = 12; l <= abs; l += 2) ledgers.push(l)
  }
  return ledgers
}

export function draw(ctx, notes, { accidental = 'sharp', clef = 'treble' } = {}) {
  const staffLeft = LAYOUT.x + LAYOUT.clefWidth
  const width = staffLeft + LAYOUT.width + 20
  const height = LAYOUT.y + 8 * LAYOUT.lineGap + 40
  const bottomLineY = LAYOUT.y + 4 * LAYOUT.lineGap // E4, bottom staff line
  const absToY = (abs) => bottomLineY - (abs - 2) * (LAYOUT.lineGap / 2)

  ctx.save()
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 1
  for (let i = 0; i < 5; i++) {
    const y = LAYOUT.y + i * LAYOUT.lineGap
    ctx.beginPath()
    ctx.moveTo(staffLeft, y)
    ctx.lineTo(staffLeft + LAYOUT.width, y)
    ctx.stroke()
  }

  // clef glyph, vertically centered on the staff
  ctx.fillStyle = '#222'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `${LAYOUT.lineGap * 5}px serif`
  ctx.fillText(CLEF_GLYPH[clef] || CLEF_GLYPH.treble,
    LAYOUT.x + LAYOUT.clefWidth / 2, LAYOUT.y + 2 * LAYOUT.lineGap)

  const names = notes.map((n) => numberToNote(n.semitone, accidental))
  const placements = ascendingPlacements(names)
  const spacing = (LAYOUT.width - 40) / Math.max(notes.length, 1)

  ctx.font = '14px serif'
  placements.forEach((p, i) => {
    const x = staffLeft + 30 + i * spacing
    const y = absToY(p.abs)

    ctx.strokeStyle = '#333'
    ledgerPositions(p.abs).forEach((l) => {
      const ly = absToY(l)
      ctx.beginPath()
      ctx.moveTo(x - 10, ly)
      ctx.lineTo(x + 10, ly)
      ctx.stroke()
    })

    ctx.fillStyle = colorForDegree(notes[i].degree)
    ctx.beginPath()
    ctx.ellipse(x, y, 6, 4.5, 0, 0, Math.PI * 2)
    ctx.fill()

    if (p.accidental) {
      ctx.fillStyle = '#333'
      ctx.fillText(p.accidental, x - 12, y)
    }
  })
  ctx.restore()
  return { width, height }
}
