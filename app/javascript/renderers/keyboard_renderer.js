import { noteToNumber, normalize, numberToNote } from 'theory/notes'
import { colorForDegree } from 'renderers/palette'

const BLACK = new Set([1, 3, 6, 8, 10]) // semitone offsets within an octave (C-based)
const LAYOUT = { x: 20, y: 20, whiteWidth: 34, whiteHeight: 150, blackWidth: 20, blackHeight: 95 }

// Pure: ordered keys with layout hints.
export function keyboardKeys({ octaves, startNote }) {
  const start = noteToNumber(startNote)
  const keys = []
  let whiteIndex = 0
  for (let i = 0; i < octaves * 12; i++) {
    const semitone = normalize(start + i)
    const offset = ((semitone - start) % 12 + 12) % 12
    const isBlack = BLACK.has(offset)
    keys.push({ semitone, isBlack, whiteIndex: isBlack ? null : whiteIndex })
    if (!isBlack) whiteIndex += 1
  }
  return keys
}

export function draw(ctx, config, notes, { accidental = 'sharp' } = {}) {
  const bySemitone = new Map(notes.map((n) => [n.semitone, n.degree]))
  const keys = keyboardKeys(config)
  const whiteCount = keys.filter((k) => !k.isBlack).length
  const width = LAYOUT.x * 2 + whiteCount * LAYOUT.whiteWidth
  const height = LAYOUT.y * 2 + LAYOUT.whiteHeight

  ctx.save()
  ctx.textAlign = 'center'
  ctx.font = '11px sans-serif'

  // white keys first
  keys.filter((k) => !k.isBlack).forEach((key) => {
    const x = LAYOUT.x + key.whiteIndex * LAYOUT.whiteWidth
    const highlighted = bySemitone.has(key.semitone)
    ctx.fillStyle = highlighted ? colorForDegree(bySemitone.get(key.semitone)) : '#fff'
    ctx.strokeStyle = '#333'
    ctx.fillRect(x, LAYOUT.y, LAYOUT.whiteWidth, LAYOUT.whiteHeight)
    ctx.strokeRect(x, LAYOUT.y, LAYOUT.whiteWidth, LAYOUT.whiteHeight)
    if (highlighted) {
      ctx.fillStyle = '#000'
      ctx.fillText(numberToNote(key.semitone, accidental), x + LAYOUT.whiteWidth / 2, LAYOUT.y + LAYOUT.whiteHeight - 12)
    }
  })
  // black keys sit between whites, offset left of the following white
  let priorWhiteX = null
  keys.forEach((key) => {
    if (!key.isBlack) { priorWhiteX = LAYOUT.x + key.whiteIndex * LAYOUT.whiteWidth; return }
    const x = priorWhiteX + LAYOUT.whiteWidth - LAYOUT.blackWidth / 2
    const highlighted = bySemitone.has(key.semitone)
    ctx.fillStyle = highlighted ? colorForDegree(bySemitone.get(key.semitone)) : '#000'
    ctx.fillRect(x, LAYOUT.y, LAYOUT.blackWidth, LAYOUT.blackHeight)
    ctx.strokeStyle = '#000'
    ctx.strokeRect(x, LAYOUT.y, LAYOUT.blackWidth, LAYOUT.blackHeight)
  })
  ctx.restore()
  return { width, height }
}
