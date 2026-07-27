import { noteToNumber, normalize, numberToNote } from 'theory/notes'
import { intervalLabel } from 'theory/intervals'
import { colorForDegree } from 'renderers/palette'

// Label for a note dot: either its name (C, E, G) or its interval from the root
// (R, 3, 5) depending on labelMode.
export function noteLabel(semitone, { labelMode, accidental, rootSemitone }) {
  if (labelMode === 'degrees' && rootSemitone != null) return intervalLabel(rootSemitone, semitone)
  return numberToNote(semitone, accidental)
}

const LAYOUT = {
  xOffset: 40, yOffset: 30, fretLength: 46, stringHeight: 26,
  markerFrets: [3, 5, 7, 9, 12, 15],
}

// Absolute MIDI of each open string, low to high. The lowest string is placed in
// the C2..B2 range, then each higher string is the lowest pitch above the previous
// — which reconstructs standard octaves (guitar EADGBE -> E2 A2 D3 G3 B3 E4).
export function openStringMidis(tuning) {
  let prev = -Infinity
  return tuning.map((note) => {
    let midi = 36 + noteToNumber(note)
    while (midi <= prev) midi += 12
    prev = midi
    return midi
  })
}

// Pure: which board positions match the semitone set.
export function fretboardPositions(config, notes) {
  const bySemitone = new Map(notes.map((n) => [n.semitone, n.degree]))
  const hits = []
  config.tuning.forEach((openNote, string) => {
    const openNumber = noteToNumber(openNote)
    for (let fret = 0; fret <= config.frets; fret++) {
      const semitone = normalize(openNumber + fret)
      if (bySemitone.has(semitone)) {
        hits.push({ string, fret, degree: bySemitone.get(semitone) })
      }
    }
  })
  return hits
}

export function draw(ctx, config, notes, { accidental = 'sharp', labelMode = 'names' } = {}) {
  const strings = config.tuning.length
  const rootNote = notes.find((n) => n.degree === 0)
  const rootSemitone = rootNote ? rootNote.semitone : null
  const width = LAYOUT.xOffset + config.frets * LAYOUT.fretLength + 20
  const height = LAYOUT.yOffset + strings * LAYOUT.stringHeight + 20

  ctx.save()
  ctx.strokeStyle = '#444'
  ctx.fillStyle = '#222'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // strings (high string on top → draw reversed)
  for (let s = 0; s < strings; s++) {
    const y = LAYOUT.yOffset + s * LAYOUT.stringHeight
    ctx.beginPath()
    ctx.moveTo(LAYOUT.xOffset, y)
    ctx.lineTo(LAYOUT.xOffset + config.frets * LAYOUT.fretLength, y)
    ctx.stroke()
  }
  // frets
  for (let f = 0; f <= config.frets; f++) {
    const x = LAYOUT.xOffset + f * LAYOUT.fretLength
    ctx.lineWidth = f === 0 ? 4 : 1
    ctx.beginPath()
    ctx.moveTo(x, LAYOUT.yOffset)
    ctx.lineTo(x, LAYOUT.yOffset + (strings - 1) * LAYOUT.stringHeight)
    ctx.stroke()
  }
  ctx.lineWidth = 1
  // position markers
  ctx.fillStyle = '#999'
  LAYOUT.markerFrets.forEach((f) => {
    if (f > config.frets) return
    const x = LAYOUT.xOffset + (f - 0.5) * LAYOUT.fretLength
    const y = LAYOUT.yOffset + (strings - 1) * LAYOUT.stringHeight + 14
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, Math.PI * 2)
    ctx.fill()
  })

  // note dots. tuning[0] is the low string → draw at the bottom row.
  const openMidis = openStringMidis(config.tuning)
  const hits = []
  fretboardPositions(config, notes).forEach(({ string, fret, degree }) => {
    const row = strings - 1 - string
    const x = LAYOUT.xOffset + fret * LAYOUT.fretLength
    const y = LAYOUT.yOffset + row * LAYOUT.stringHeight
    const semitone = normalize(noteToNumber(config.tuning[string]) + fret)
    const r = degree === 0 ? 12 : 9
    ctx.fillStyle = colorForDegree(degree)
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.fillText(noteLabel(semitone, { labelMode, accidental, rootSemitone }), x, y)
    hits.push({ x: x - r, y: y - r, w: r * 2, h: r * 2, midi: openMidis[string] + fret })
  })
  ctx.restore()
  return { width, height, hits }
}
