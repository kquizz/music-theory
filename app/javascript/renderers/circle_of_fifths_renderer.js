import { noteToNumber } from 'theory/notes'

// Circle of fifths, clockwise from 12 o'clock. `root`/`minorRoot` are the app's
// (sharp-spelled) root values to navigate to; `major`/`minor` are display labels
// using conventional key spelling; `sig` is the key signature.
export const CIRCLE = [
  { major: 'C', root: 'C', minor: 'Am', minorRoot: 'A', sig: '' },
  { major: 'G', root: 'G', minor: 'Em', minorRoot: 'E', sig: '1♯' },
  { major: 'D', root: 'D', minor: 'Bm', minorRoot: 'B', sig: '2♯' },
  { major: 'A', root: 'A', minor: 'F♯m', minorRoot: 'F#', sig: '3♯' },
  { major: 'E', root: 'E', minor: 'C♯m', minorRoot: 'C#', sig: '4♯' },
  { major: 'B', root: 'B', minor: 'G♯m', minorRoot: 'G#', sig: '5♯' },
  { major: 'G♭', root: 'F#', minor: 'E♭m', minorRoot: 'D#', sig: '6♭' },
  { major: 'D♭', root: 'C#', minor: 'B♭m', minorRoot: 'A#', sig: '5♭' },
  { major: 'A♭', root: 'G#', minor: 'Fm', minorRoot: 'F', sig: '4♭' },
  { major: 'E♭', root: 'D#', minor: 'Cm', minorRoot: 'C', sig: '3♭' },
  { major: 'B♭', root: 'A#', minor: 'Gm', minorRoot: 'G', sig: '2♭' },
  { major: 'F', root: 'F', minor: 'Dm', minorRoot: 'D', sig: '1♭' },
]

const R = { outerR: 135, boundaryR: 90, holeR: 38 }

export function radii() {
  return { ...R }
}

// Pure: circle index (0 = C at top) for an angle measured clockwise from top.
export function indexFromAngle(angleRad) {
  const seg = (Math.PI * 2) / 12
  return ((Math.round(angleRad / seg) % 12) + 12) % 12
}

// Pure: which key a click at (dx, dy) from the circle center selects, or null if
// outside the ring. Returns { entry, isMinor }.
export function hitTest(dx, dy) {
  const dist = Math.hypot(dx, dy)
  if (dist < R.holeR || dist > R.outerR) return null
  const angle = Math.atan2(dx, -dy) // 0 at top, increasing clockwise
  return { entry: CIRCLE[indexFromAngle(angle)], isMinor: dist < R.boundaryR }
}

function wedge(ctx, cx, cy, rOuter, rInner, a0, a1, fill) {
  ctx.beginPath()
  ctx.arc(cx, cy, rOuter, a0, a1)
  ctx.arc(cx, cy, rInner, a1, a0, true)
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
  ctx.strokeStyle = '#ccc'
  ctx.lineWidth = 1
  ctx.stroke()
}

// Draws the wheel centered at (cx, cy). Lights the parent-key wedge
// (`highlightRoot`, a major key) blue to show the key signature, and puts an
// orange tonic marker on the note you picked (outer major, or inner minor when
// `tonicMinor`). With `scalePcs` (pitch classes 0-11) it also dots each outer
// wedge whose major root is in the scale (the `rootPc` dot stands out), joined by
// a faint arc where neighbors touch.
export function draw(ctx, cx, cy, { highlightRoot, tonicRoot, tonicMinor = false, scalePcs, rootPc } = {}) {
  const { outerR, boundaryR, holeR } = R
  const seg = (Math.PI * 2) / 12
  const majorR = (outerR + boundaryR) / 2
  const minorR = (boundaryR + holeR) / 2

  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  CIRCLE.forEach((entry, i) => {
    const a0 = i * seg - seg / 2 - Math.PI / 2
    const a1 = a0 + seg
    const px = (r) => cx + r * Math.sin(i * seg)
    const py = (r) => cy - r * Math.cos(i * seg)

    wedge(ctx, cx, cy, outerR, boundaryR, a0, a1, entry.root === highlightRoot ? '#8ec3ff' : '#fff')
    wedge(ctx, cx, cy, boundaryR, holeR, a0, a1, '#f6f6f6')

    const markOuter = !tonicMinor && entry.root === tonicRoot
    const markInner = tonicMinor && entry.minorRoot === tonicRoot
    if (markOuter || markInner) {
      ctx.fillStyle = '#f5a623'
      ctx.beginPath()
      ctx.arc(px(markOuter ? majorR : minorR), py(markOuter ? majorR : minorR), 16, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.fillStyle = '#111'
    ctx.font = 'bold 16px sans-serif'
    ctx.fillText(entry.major, px(majorR), py(majorR) - 5)
    ctx.fillStyle = markOuter ? '#7a4a00' : '#999'
    ctx.font = '9px sans-serif'
    ctx.fillText(entry.sig, px(majorR), py(majorR) + 9)

    ctx.fillStyle = '#555'
    ctx.font = '12px sans-serif'
    ctx.fillText(entry.minor, px(minorR), py(minorR))
  })

  if (scalePcs) drawScaleDots(ctx, cx, cy, scalePcs, rootPc)

  ctx.restore()
}

// Dots sit near the outer edge, clear of the key label and signature text.
function drawScaleDots(ctx, cx, cy, scalePcs, rootPc) {
  const seg = (Math.PI * 2) / 12
  const dotR = R.outerR - 6
  const on = CIRCLE.map((entry) => scalePcs.includes(noteToNumber(entry.root)))
  const angle = (i) => i * seg - Math.PI / 2

  ctx.strokeStyle = '#9aa0a6'
  ctx.lineWidth = 1.5
  on.forEach((isOn, i) => {
    if (!isOn || !on[(i + 1) % 12]) return
    ctx.beginPath()
    ctx.arc(cx, cy, dotR, angle(i), angle(i) + seg)
    ctx.stroke()
  })

  CIRCLE.forEach((entry, i) => {
    if (!on[i]) return
    const isRoot = noteToNumber(entry.root) === rootPc
    ctx.fillStyle = isRoot ? '#d9731a' : '#444'
    ctx.beginPath()
    ctx.arc(cx + dotR * Math.sin(i * seg), cy - dotR * Math.cos(i * seg), isRoot ? 5 : 3.5, 0, Math.PI * 2)
    ctx.fill()
  })
}
