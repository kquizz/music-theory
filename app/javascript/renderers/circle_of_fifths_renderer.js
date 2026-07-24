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

const GEO = { cx: 250, cy: 190, outerR: 150, boundaryR: 100, holeR: 45 }

// Pure: circle index (0 = C at top) for an angle measured clockwise from top.
export function indexFromAngle(angleRad) {
  const seg = (Math.PI * 2) / 12
  return ((Math.round(angleRad / seg) % 12) + 12) % 12
}

// Pure: which key a click at (dx, dy) from the circle center selects, or null if
// outside the ring. Returns { entry, isMinor }.
export function hitTest(dx, dy) {
  const dist = Math.hypot(dx, dy)
  if (dist < GEO.holeR || dist > GEO.outerR) return null
  const angle = Math.atan2(dx, -dy) // 0 at top, increasing clockwise
  const entry = CIRCLE[indexFromAngle(angle)]
  return { entry, isMinor: dist < GEO.boundaryR }
}

export function geometry() {
  return { ...GEO }
}

export function draw(ctx, { highlightRoot } = {}) {
  const { cx, cy, outerR, boundaryR, holeR } = GEO
  const seg = (Math.PI * 2) / 12
  const majorR = (outerR + boundaryR) / 2
  const minorR = (boundaryR + holeR) / 2

  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  CIRCLE.forEach((entry, i) => {
    const a0 = i * seg - seg / 2 - Math.PI / 2 // wedge start (canvas angle)
    const a1 = a0 + seg
    const highlighted = entry.root === highlightRoot

    // wedge fill
    ctx.beginPath()
    ctx.arc(cx, cy, outerR, a0, a1)
    ctx.arc(cx, cy, holeR, a1, a0, true)
    ctx.closePath()
    ctx.fillStyle = highlighted ? '#cfe3ff' : '#fff'
    ctx.fill()
    ctx.strokeStyle = '#ccc'
    ctx.lineWidth = 1
    ctx.stroke()

    const px = (r) => cx + r * Math.sin(i * seg)
    const py = (r) => cy - r * Math.cos(i * seg)

    ctx.fillStyle = '#111'
    ctx.font = 'bold 17px sans-serif'
    ctx.fillText(entry.major, px(majorR), py(majorR) - 6)
    ctx.fillStyle = '#888'
    ctx.font = '10px sans-serif'
    ctx.fillText(entry.sig, px(majorR), py(majorR) + 9)

    ctx.fillStyle = '#555'
    ctx.font = '13px sans-serif'
    ctx.fillText(entry.minor, px(minorR), py(minorR))
  })

  // ring outlines
  ctx.strokeStyle = '#999'
  ;[outerR, boundaryR, holeR].forEach((r) => {
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()
  })

  ctx.restore()
  return { width: cx + outerR + 20, height: cy + outerR + 20 }
}
