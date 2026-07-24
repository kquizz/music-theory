import { numberToNote, noteToNumber } from 'theory/notes'
import { colorForDegree } from 'renderers/palette'

const LETTER_STEP = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 }
const LAYOUT = { x: 20, y: 44, lineGap: 18, width: 480, clefWidth: 46 }
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

// Draw one 5-line staff (with clef + notes) whose top line is at `yTop`.
function drawStaff(ctx, notes, yTop, { accidental, clef }) {
  const staffLeft = LAYOUT.x + LAYOUT.clefWidth
  const bottomLineY = yTop + 4 * LAYOUT.lineGap // E4, bottom staff line
  const absToY = (abs) => bottomLineY - (abs - 2) * (LAYOUT.lineGap / 2)

  ctx.strokeStyle = '#333'
  ctx.lineWidth = 1
  for (let i = 0; i < 5; i++) {
    const y = yTop + i * LAYOUT.lineGap
    ctx.beginPath()
    ctx.moveTo(staffLeft, y)
    ctx.lineTo(staffLeft + LAYOUT.width, y)
    ctx.stroke()
  }

  ctx.fillStyle = '#222'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `${LAYOUT.lineGap * 5}px serif`
  ctx.fillText(CLEF_GLYPH[clef] || CLEF_GLYPH.treble,
    LAYOUT.x + LAYOUT.clefWidth / 2, yTop + 2 * LAYOUT.lineGap)

  const names = notes.map((n) => numberToNote(n.semitone, accidental))
  const placements = ascendingPlacements(names)
  const spacing = (LAYOUT.width - 50) / Math.max(notes.length, 1)

  ctx.font = '18px serif'
  placements.forEach((p, i) => {
    const x = staffLeft + 40 + i * spacing
    const y = absToY(p.abs)

    ctx.strokeStyle = '#333'
    ledgerPositions(p.abs).forEach((l) => {
      const ly = absToY(l)
      ctx.beginPath()
      ctx.moveTo(x - 14, ly)
      ctx.lineTo(x + 14, ly)
      ctx.stroke()
    })

    ctx.fillStyle = colorForDegree(notes[i].degree)
    ctx.beginPath()
    ctx.ellipse(x, y, 9, 6.5, 0, 0, Math.PI * 2)
    ctx.fill()

    if (p.accidental) {
      ctx.fillStyle = '#333'
      ctx.fillText(p.accidental, x - 17, y)
    }
  })

  return staffLeft + LAYOUT.width + 20
}

// `systems` is an array of note arrays — one stacked staff per entry, so a
// 2-octave scale puts each octave on its own line instead of climbing off the top.
export function draw(ctx, systems, { accidental = 'sharp', clef = 'treble' } = {}) {
  const stride = 9 * LAYOUT.lineGap // vertical space per staff (incl. ledger room)
  let width = 0
  ctx.save()
  systems.forEach((notes, s) => {
    const w = drawStaff(ctx, notes, LAYOUT.y + s * stride, { accidental, clef })
    width = Math.max(width, w)
  })
  ctx.restore()
  return { width, height: LAYOUT.y + systems.length * stride }
}
