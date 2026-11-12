// The Tonnetz on a 3x4 torus grid. Pure module (no rendering).
//
// pc(i, j) = (4i + 3j) mod 12. i (0..2) steps by major thirds and wraps around
// the tube; j (0..3) steps by minor thirds and wraps around the ring. Because
// 3 and 4 are coprime, each of the 12 pitch classes appears exactly once.
// A perfect fifth is +4 +3 = the diagonal step (i+1, j+1).

export const SIZE_I = 3 // major-third axis (tube)
export const SIZE_J = 4 // minor-third axis (ring)

// Display names: flats for Eb/Ab/Bb, sharps for C#/F#.
export const NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B']

const mod = (n, m) => ((n % m) + m) % m

export function pcAt(i, j) {
  return mod(4 * mod(i, SIZE_I) + 3 * mod(j, SIZE_J), 12)
}

// Inverse lookup: pitch class -> [i, j] cell.
export function cellOf(pc) {
  for (let i = 0; i < SIZE_I; i++) {
    for (let j = 0; j < SIZE_J; j++) if (pcAt(i, j) === mod(pc, 12)) return [i, j]
  }
  throw new Error(`no cell for pc ${pc}`)
}

export function noteName(pc) {
  return NAMES[mod(pc, 12)]
}

// The 24 triads. `cells` are wrapped grid cells; `uv` are the same three corners
// in unwrapped coordinates (so a patch can be drawn continuously across the
// seam: u/j may reach SIZE_I / SIZE_J).
function buildTriads() {
  const list = []
  for (const quality of ['major', 'minor']) {
    for (let root = 0; root < 12; root++) {
      const [i, j] = cellOf(root)
      const uv = quality === 'major'
        ? [[i, j], [i + 1, j], [i + 1, j + 1]]
        : [[i, j], [i, j + 1], [i + 1, j + 1]]
      list.push({
        root,
        quality,
        pcs: uv.map(([a, b]) => pcAt(a, b)),
        cells: uv.map(([a, b]) => [mod(a, SIZE_I), mod(b, SIZE_J)]),
        uv,
      })
    }
  }
  return list
}

export const TRIADS = buildTriads()

export function triadAt(root, quality) {
  return TRIADS.find((t) => t.root === mod(root, 12) && t.quality === quality)
}

export function triadName(t) {
  return `${noteName(t.root)} ${t.quality}`
}

// MIDI notes for the chord, root position starting at middle C.
export function triadMidis(t) {
  const third = t.quality === 'major' ? 4 : 3
  return [60 + t.root, 60 + t.root + third, 60 + t.root + 7]
}

const RELATION = {
  major: { 9: 'relative', 0: 'parallel', 4: 'leading-tone' },
  minor: { 3: 'relative', 0: 'parallel', 8: 'leading-tone' },
}

// The three triads sharing an edge (two pitch classes) with `t`.
export function neighbors(t) {
  const other = t.quality === 'major' ? 'minor' : 'major'
  const out = []
  for (const cand of TRIADS) {
    if (cand.quality !== other) continue
    const shared = t.pcs.filter((p) => cand.pcs.includes(p))
    if (shared.length !== 2) continue
    const relation = RELATION[t.quality][mod(cand.root - t.root, 12)]
    out.push({ triad: cand, relation, shared })
  }
  const order = ['relative', 'parallel', 'leading-tone']
  return out.sort((a, b) => order.indexOf(a.relation) - order.indexOf(b.relation))
}

// Circle of fifths as a path of 12 cells: step k is cell (k mod 3, k mod 4).
export function fifthsPath() {
  return Array.from({ length: 12 }, (_, k) => ({
    step: k, i: k % SIZE_I, j: k % SIZE_J, pc: pcAt(k, k),
  }))
}
